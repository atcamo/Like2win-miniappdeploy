import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleRedisService } from '@/lib/services/dailyRaffleRedisService';
import { dailyRaffleService } from '@/lib/services/dailyRaffleService';

/**
 * Cache-based Leaderboard API (Daily Reset Fixed)
 * Returns empty leaderboard to ensure daily reset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`🏆 Cache API: Getting real leaderboard data (limit: ${limit})`);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Use Redis if available, fallback to in-memory for local development
    const isRedisAvailable = process.env.REDIS_URL && process.env.REDIS_URL.startsWith('https');
    
    let leaderboard, raffleInfo, stats;
    
    if (isRedisAvailable) {
      leaderboard = await dailyRaffleRedisService.getLeaderboard(limit);
      raffleInfo = dailyRaffleRedisService.getRaffleInfo();
      stats = await dailyRaffleRedisService.getTotalStats();
    } else {
      leaderboard = dailyRaffleService.getLeaderboard(limit);
      raffleInfo = dailyRaffleService.getRaffleInfo();
      stats = dailyRaffleService.getTotalStats();
    }

    // Return real leaderboard data
    return NextResponse.json({
      success: true,
      source: 'daily_reset_fixed',
      data: {
        leaderboard: leaderboard.map(user => ({
          fid: user.fid,
          tickets: user.tickets,
          rank: user.rank,
          isTopThree: user.isTopThree,
          displayName: `User ${user.fid}`,
          username: `user_${user.fid}`,
          engagementCount: user.engagements?.length || 0,
          lastActivity: user.lastActivity
        })),
        raffle: {
          id: raffleInfo.id,
          weekPeriod: raffleInfo.weekPeriod,
          totalTickets: stats.totalTickets,
          totalParticipants: stats.totalParticipants,
          status: raffleInfo.status,
          endDate: raffleInfo.endDate
        }
      },
      message: `Real leaderboard data - ${stats.totalParticipants} participants with ${stats.totalTickets} total tickets`,
      timestamp: today.toISOString()
    });

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
 * POST endpoint for manual leaderboard cache refresh (Daily Reset)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual leaderboard cache refresh requested (Daily Reset)');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Always return empty for daily reset
    return NextResponse.json({
      success: true,
      message: 'Daily reset active - no cache to refresh',
      data: {
        leaderboard: [],
        raffle: {
          id: `daily-raffle-${todayStr}`,
          weekPeriod: `Daily Raffle - ${todayStr}`,
          totalTickets: 0,
          totalParticipants: 0
        }
      },
      timestamp: today.toISOString()
    });

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