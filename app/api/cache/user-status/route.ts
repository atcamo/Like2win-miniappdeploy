import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/services/cacheService';

/**
 * Cache-based User Status API
 * Ultra-fast endpoint that reads user ticket data from Redis cache
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFid = searchParams.get('fid');

    if (!userFid) {
      return NextResponse.json(
        { error: 'Missing required parameter: fid' },
        { status: 400 }
      );
    }

    console.log(`🚀 Cache API: Getting status for user ${userFid}`);

    // Try to get user status from cache first
    const cachedUserData = await CacheService.getUserStatus(userFid);
    
    if (cachedUserData) {
      // Get active raffle from cache too
      const cachedRaffle = await CacheService.getActiveRaffle();
      
      return NextResponse.json({
        success: true,
        source: 'cache',
        data: {
          user: {
            fid: parseInt(userFid),
            currentTickets: cachedUserData.currentTickets,
            lastUpdated: cachedUserData.lastUpdated
          },
          raffle: cachedRaffle ? {
            id: cachedRaffle.id,
            weekPeriod: cachedRaffle.weekPeriod,
            startDate: cachedRaffle.startDate,
            endDate: cachedRaffle.endDate,
            status: cachedRaffle.status,
            totalTickets: cachedRaffle.totalTickets,
            totalParticipants: cachedRaffle.totalParticipants
          } : null
        },
        timestamp: new Date().toISOString()
      });
    }

    // Try local data first before database
    console.log(`📁 Cache miss for user ${userFid}, trying local data first...`);
    
    try {
      const { readFileSync, existsSync } = require('fs');
      const { join } = require('path');
      
      const dataPath = join(process.cwd(), 'data');
      const userTicketsFile = join(dataPath, 'local-user-tickets.json');
      const raffleDataFile = join(dataPath, 'local-raffle-data.json');

      if (existsSync(userTicketsFile) && existsSync(raffleDataFile)) {
        console.log(`✅ Found local data files for user ${userFid}`);
        
        const userTickets = JSON.parse(readFileSync(userTicketsFile, 'utf8'));
        const raffleData = JSON.parse(readFileSync(raffleDataFile, 'utf8'));
        
        const userData = userTickets[userFid];
        const currentTickets = userData?.tickets || 0;
        
        console.log(`🎫 User ${userFid} has ${currentTickets} tickets from local data`);

        return NextResponse.json({
          success: true,
          source: 'local_data',
          data: {
            user: {
              fid: parseInt(userFid),
              currentTickets,
              username: userData?.username,
              displayName: userData?.username || `User ${userFid}`,
              lastUpdated: userData?.lastActivity || raffleData.lastUpdated
            },
            raffle: {
              id: raffleData.id || 'local-raffle-2025',
              weekPeriod: raffleData.weekPeriod || 'Week 34-37 2025 (Launch Raffle)',
              startDate: raffleData.startDate || '2025-08-18T00:00:00.000Z',
              endDate: raffleData.endDate || (() => {
                // Calculate next daily raffle end (today at 23:59:59 UTC)
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                // If it's already past today's deadline, set for tomorrow
                if (now > today) {
                  today.setDate(today.getDate() + 1);
                }
                return today.toISOString();
              })(),
              status: 'ACTIVE',
              totalTickets: raffleData.totalTickets || 0,
              totalParticipants: raffleData.totalParticipants || 0
            }
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (localError) {
      console.log(`⚠️ Local data not available for user ${userFid}:`, localError);
    }

    // If not in cache or local data, fall back to database
    console.log(`⚡ Falling back to database for user ${userFid}`);
    
    // Trigger background sync for this user (don't wait)
    const { BackgroundSyncService } = await import('@/lib/services/backgroundSync');
    BackgroundSyncService.syncUserData(userFid).catch(error => {
      console.error('Background sync failed for user:', userFid, error);
    });

    // Get data directly from database as fallback
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // Get active raffle
      const raffleResult = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate", status, "totalTickets", "totalParticipants"
        FROM raffles 
        WHERE status = 'ACTIVE' 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (raffleResult.rows.length === 0) {
        return NextResponse.json({
          success: true,
          source: 'database_fallback',
          data: {
            user: null,
            raffle: null
          },
          message: 'No active raffle found',
          timestamp: new Date().toISOString()
        });
      }

      const raffle = raffleResult.rows[0];

      // Get user tickets
      const userResult = await pool.query(`
        SELECT "ticketsCount"
        FROM user_tickets 
        WHERE "raffleId" = $1 AND "userFid" = $2
      `, [raffle.id, parseInt(userFid)]);

      const userTickets = userResult.rows.length > 0 ? userResult.rows[0] : null;

      // Cache this data for next time
      if (userTickets) {
        await CacheService.cacheUserStatus(
          userFid, 
          userTickets.ticketsCount || 0, 
          raffle.id
        );
      }

      return NextResponse.json({
        success: true,
        source: 'database_fallback',
        data: {
          user: {
            fid: parseInt(userFid),
            currentTickets: userTickets?.ticketsCount || 0,
            lastUpdated: new Date().toISOString()
          },
          raffle: {
            id: raffle.id,
            weekPeriod: raffle.weekPeriod,
            startDate: raffle.startDate.toISOString(),
            endDate: raffle.endDate.toISOString(),
            status: raffle.status,
            totalTickets: raffle.totalTickets || 0,
            totalParticipants: raffle.totalParticipants || 0
          }
        },
        timestamp: new Date().toISOString()
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Cache API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual cache refresh
 */
export async function POST(request: NextRequest) {
  try {
    const { userFid } = await request.json();

    if (!userFid) {
      return NextResponse.json(
        { error: 'Missing required parameter: userFid' },
        { status: 400 }
      );
    }

    console.log(`🔄 Manual cache refresh requested for user ${userFid}`);

    // Force invalidate cache
    await CacheService.invalidateUserCache(userFid);

    // Force sync user data
    const { BackgroundSyncService } = await import('@/lib/services/backgroundSync');
    const syncResult = await BackgroundSyncService.syncUserData(userFid);

    if (syncResult) {
      // Get fresh data
      const freshData = await CacheService.getUserStatus(userFid);
      
      return NextResponse.json({
        success: true,
        message: 'Cache refreshed successfully',
        data: freshData,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to refresh cache' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Cache refresh error:', error);
    return NextResponse.json(
      { 
        error: 'Cache refresh failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}