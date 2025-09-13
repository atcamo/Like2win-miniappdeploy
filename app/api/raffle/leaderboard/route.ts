import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleRedisService } from '@/lib/services/dailyRaffleRedisService';
import { dailyRaffleService } from '@/lib/services/dailyRaffleService';

/**
 * Raffle Leaderboard API (Daily Reset Fixed)
 * Returns actual leaderboard from daily raffle service
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`🏆 Raffle Leaderboard API (Daily Reset) (limit: ${limit})`);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Use Redis if available, fallback to in-memory for local development
    const isRedisAvailable = process.env.REDIS_URL && process.env.REDIS_URL.startsWith('https');
    
    let leaderboard, raffleInfo, stats;
    
    if (isRedisAvailable) {
      // Get actual leaderboard data from daily Redis service
      leaderboard = await dailyRaffleRedisService.getLeaderboard(limit);
      raffleInfo = dailyRaffleRedisService.getRaffleInfo();
      stats = await dailyRaffleRedisService.getTotalStats();
    } else {
      // Get actual leaderboard data from daily in-memory service (local dev)
      leaderboard = dailyRaffleService.getLeaderboard(limit);
      raffleInfo = dailyRaffleService.getRaffleInfo();
      stats = dailyRaffleService.getTotalStats();
    }

    return NextResponse.json({
      success: true,
      source: 'daily_reset_fixed',
      leaderboard: leaderboard.map(user => ({
        fid: user.fid,
        tickets: user.tickets,
        rank: user.rank,
        isTopThree: user.isTopThree,
        displayName: `User ${user.fid}`,
        username: `user_${user.fid}`,
        engagementCount: user.engagements.length,
        lastActivity: user.lastActivity
      })),
      raffle: {
        id: raffleInfo.id,
        weekPeriod: raffleInfo.weekPeriod,
        status: 'ACTIVE',
        raffleType: 'DAILY',
        totalTickets: stats.totalTickets,
        totalParticipants: stats.totalParticipants,
        prizeAmount: 500,
        dayNumber: today.getDay() || 7
      },
      pagination: {
        limit,
        total: stats.totalParticipants,
        hasMore: stats.totalParticipants > limit
      },
      message: `Daily reset active - showing ${stats.totalParticipants} participants with ${stats.totalTickets} total tickets`,
      timestamp: today.toISOString()
    });

  } catch (error) {
    console.error('❌ Leaderboard error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}