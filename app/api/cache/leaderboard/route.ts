import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/services/cacheService';

/**
 * Cache-based Leaderboard API
 * Ultra-fast endpoint that reads leaderboard data from Redis cache
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`🏆 Cache API: Getting leaderboard (limit: ${limit})`);

    // Get active raffle from cache first
    const cachedRaffle = await CacheService.getActiveRaffle();
    
    if (!cachedRaffle) {
      console.log('⚠️ No active raffle in cache, checking local data...');
      
      // Try local data immediately if cache is empty
      try {
        const { readFileSync, existsSync } = require('fs');
        const { join } = require('path');
        
        const dataPath = join(process.cwd(), 'data');
        const userTicketsFile = join(dataPath, 'local-user-tickets.json');
        const raffleDataFile = join(dataPath, 'local-raffle-data.json');

        if (existsSync(userTicketsFile) && existsSync(raffleDataFile)) {
          console.log(`✅ Found local data files`);
          
          const userTickets = JSON.parse(readFileSync(userTicketsFile, 'utf8'));
          const raffleData = JSON.parse(readFileSync(raffleDataFile, 'utf8'));
          
          const leaderboard = Object.entries(userTickets)
            .map(([fid, data]: [string, any], index: number) => ({
              rank: index + 1,
              fid: fid,
              tickets: data.tickets,
              username: data.username,
              displayName: data.username || `User ${fid}`
            }))
            .sort((a, b) => b.tickets - a.tickets)
            .slice(0, limit)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));
          
          console.log(`🏆 Loaded ${leaderboard.length} entries from local data (cache bypass)`);

          return NextResponse.json({
            success: true,
            source: 'local_data_direct',
            data: {
              leaderboard,
              raffle: {
                id: raffleData.id || 'local-raffle-2025',
                weekPeriod: raffleData.weekPeriod || 'Week 34-37 2025 (Launch Raffle)',
                totalTickets: raffleData.totalTickets || 0,
                totalParticipants: raffleData.totalParticipants || 0
              }
            },
            timestamp: new Date().toISOString()
          });
        }
      } catch (localError) {
        console.log(`⚠️ Local data not available:`, localError);
      }

      // If no local data either, return empty
      return NextResponse.json({
        success: true,
        source: 'cache',
        data: {
          leaderboard: [],
          raffle: null
        },
        message: 'No active raffle found in cache or local data',
        timestamp: new Date().toISOString()
      });
    }

    // Get leaderboard from cache
    const cachedLeaderboard = await CacheService.getLeaderboard(cachedRaffle.id, limit);

    if (cachedLeaderboard.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'cache',
        data: {
          leaderboard: cachedLeaderboard,
          raffle: {
            id: cachedRaffle.id,
            weekPeriod: cachedRaffle.weekPeriod,
            totalTickets: cachedRaffle.totalTickets,
            totalParticipants: cachedRaffle.totalParticipants
          }
        },
        timestamp: new Date().toISOString()
      });
    }

    // Try local data first before database
    console.log(`📁 Cache miss for leaderboard, trying local data first...`);
    
    try {
      const { readFileSync, existsSync } = require('fs');
      const { join } = require('path');
      
      const dataPath = join(process.cwd(), 'data');
      const userTicketsFile = join(dataPath, 'local-user-tickets.json');
      const raffleDataFile = join(dataPath, 'local-raffle-data.json');

      if (existsSync(userTicketsFile) && existsSync(raffleDataFile)) {
        console.log(`✅ Found local data files`);
        
        const userTickets = JSON.parse(readFileSync(userTicketsFile, 'utf8'));
        const raffleData = JSON.parse(readFileSync(raffleDataFile, 'utf8'));
        
        const leaderboard = Object.entries(userTickets)
          .map(([fid, data]: [string, any], index: number) => ({
            rank: index + 1,
            fid: fid,
            tickets: data.tickets,
            username: data.username,
            displayName: data.username || `User ${fid}`
          }))
          .sort((a, b) => b.tickets - a.tickets)
          .slice(0, limit)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));
        
        console.log(`🏆 Loaded ${leaderboard.length} entries from local data`);

        return NextResponse.json({
          success: true,
          source: 'local_data',
          data: {
            leaderboard,
            raffle: {
              id: raffleData.id || 'local-raffle-2025',
              weekPeriod: raffleData.weekPeriod || 'Week 34-37 2025 (Launch Raffle)',
              totalTickets: raffleData.totalTickets || 0,
              totalParticipants: raffleData.totalParticipants || 0
            }
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (localError) {
      console.log(`⚠️ Local data not available:`, localError);
    }

    // Fall back to database
    console.log(`⚡ Falling back to database`);
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // Get leaderboard from database
      const leaderboardResult = await pool.query(`
        SELECT ut."userFid", ut."ticketsCount"
        FROM user_tickets ut
        WHERE ut."raffleId" = $1
        AND ut."ticketsCount" > 0
        ORDER BY ut."ticketsCount" DESC, ut."updatedAt" ASC
        LIMIT $2
      `, [cachedRaffle.id, limit]);

      const leaderboard = leaderboardResult.rows.map((row: any, index: number) => ({
        rank: index + 1,
        fid: row.userFid.toString(),
        tickets: row.ticketsCount || 0
      }));

      // Cache the leaderboard for next time
      await CacheService.cacheLeaderboard(cachedRaffle.id, leaderboard);

      return NextResponse.json({
        success: true,
        source: 'database_fallback',
        data: {
          leaderboard,
          raffle: {
            id: cachedRaffle.id,
            weekPeriod: cachedRaffle.weekPeriod,
            totalTickets: cachedRaffle.totalTickets,
            totalParticipants: cachedRaffle.totalParticipants
          }
        },
        timestamp: new Date().toISOString()
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Leaderboard cache API error:', error);
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
 * POST endpoint for manual leaderboard cache refresh
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual leaderboard cache refresh requested');

    // Get active raffle first
    const cachedRaffle = await CacheService.getActiveRaffle();
    
    if (!cachedRaffle) {
      return NextResponse.json(
        { error: 'No active raffle found' },
        { status: 400 }
      );
    }

    // Invalidate current leaderboard cache
    await CacheService.invalidateRaffleCache(cachedRaffle.id);

    // Trigger background sync for leaderboard
    const { BackgroundSyncService } = await import('@/lib/services/backgroundSync');
    const syncResult = await BackgroundSyncService.manualSync();

    if (syncResult.success) {
      // Get fresh leaderboard
      const freshLeaderboard = await CacheService.getLeaderboard(cachedRaffle.id);
      
      return NextResponse.json({
        success: true,
        message: 'Leaderboard cache refreshed successfully',
        data: {
          leaderboard: freshLeaderboard,
          syncDuration: syncResult.duration
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to refresh leaderboard cache',
          details: syncResult.error
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Leaderboard cache refresh error:', error);
    return NextResponse.json(
      { 
        error: 'Leaderboard cache refresh failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}