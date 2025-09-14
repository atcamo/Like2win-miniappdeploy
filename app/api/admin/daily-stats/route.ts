import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleRedisService } from '@/lib/services/dailyRaffleRedisService';

/**
 * Daily Admin Stats API - NEW ENDPOINT
 * Provides real-time daily raffle statistics with forced Redis usage
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Loading DAILY admin stats - NEW ENDPOINT - REDIS ONLY...');

    // FORCE: Always use Redis daily raffle system, never local files
    console.log('⚡ Using Redis daily raffle service (FORCED - NEW ENDPOINT)...');

    const raffleInfo = dailyRaffleRedisService.getRaffleInfo();
    const stats = await dailyRaffleRedisService.getTotalStats();
    const leaderboard = await dailyRaffleRedisService.getLeaderboard(50);

    // Create current daily raffle data
    const currentRaffle = {
      id: raffleInfo.id,
      weekPeriod: raffleInfo.weekPeriod,
      startDate: raffleInfo.startDate,
      endDate: raffleInfo.endDate,
      status: raffleInfo.status,
      totalTickets: stats.totalTickets,
      totalParticipants: stats.totalParticipants
    };

    // Convert leaderboard to admin format
    const topUsers = leaderboard.map((user) => ({
      rank: user.rank,
      userFid: user.fid.toString(),
      username: `user_${user.fid}`,
      displayName: `User ${user.fid}`,
      pfpUrl: '', // No PFP data in Redis service
      ticketsCount: user.tickets,
      isTopThree: user.isTopThree
    }));

    // System health - Redis service status
    const debugInfo = await dailyRaffleRedisService.getDebugInfo();
    const systemHealth = {
      cache: debugInfo.redisAvailable,
      database: debugInfo.redisAvailable,
      background: false
    };

    console.log(`✅ Redis DAILY raffle data: ${stats.totalParticipants} participants, ${stats.totalTickets} tickets [${new Date().toISOString()}]`);

    return NextResponse.json({
      success: true,
      source: 'redis_daily_NEW_ENDPOINT',
      deploymentVersion: '2025-09-14-NEW-ENDPOINT',
      timestamp: Date.now(),
      data: {
        currentRaffle,
        topUsers,
        totalUsers: stats.totalParticipants,
        systemHealth,
        lastUpdated: new Date().toISOString()
      },
      debug: {
        redisAvailable: debugInfo.redisAvailable,
        currentDate: dailyRaffleRedisService.getRaffleInfo().date,
        tickets: stats.totalTickets,
        participants: stats.totalParticipants,
        endpoint: 'NEW_DAILY_ENDPOINT'
      }
    });

  } catch (error) {
    console.error('❌ Daily admin stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to load daily admin stats',
        details: error instanceof Error ? error.message : String(error),
        endpoint: 'NEW_DAILY_ENDPOINT'
      },
      { status: 500 }
    );
  }
}