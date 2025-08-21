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
      return NextResponse.json({
        success: true,
        source: 'cache',
        data: {
          leaderboard: [],
          raffle: null
        },
        message: 'No active raffle found',
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

    // If not in cache, fall back to database
    console.log(`⚡ Cache miss for leaderboard, falling back to database`);
    
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

      const leaderboard = leaderboardResult.rows.map((row, index) => ({
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