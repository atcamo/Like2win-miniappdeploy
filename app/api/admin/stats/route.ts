import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleRedisService } from '@/lib/services/dailyRaffleRedisService';

/**
 * Admin Stats API
 * Provides real-time statistics for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Loading admin stats - FORCED REDIS DAILY VERSION...');

    // FORCE: Never use local data files, always use Redis daily raffle system
    console.log('⚡ Using Redis daily raffle service for admin stats (FORCED)...');
    console.log('🚫 Local data files explicitly ignored in this version');

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

    // Convert leaderboard to admin format with clean user data (no FIDs shown)
    const topUsers = leaderboard.map((user) => {
      const cleanUsername = user.username || `user_${user.fid}`;
      const cleanDisplayName = user.displayName && user.displayName !== cleanUsername
        ? user.displayName
        : ''; // Only show displayName if different from username

      return {
        rank: user.rank,
        userFid: user.fid.toString(), // Keep for backend reference but not displayed
        username: cleanUsername,
        displayName: cleanDisplayName,
        pfpUrl: user.pfpUrl || '',
        ticketsCount: user.tickets,
        isTopThree: user.isTopThree
      };
    });

    // System health - Redis service status
    const debugInfo = await dailyRaffleRedisService.getDebugInfo();
    const systemHealth = {
      cache: debugInfo.redisAvailable, // Redis is our cache/storage
      database: debugInfo.redisAvailable, // Redis as persistent storage
      background: false // No background sync needed with Redis
    };

    console.log(`✅ Redis daily raffle admin data: ${stats.totalParticipants} participants, ${stats.totalTickets} tickets [${new Date().toISOString()}]`);

    return NextResponse.json({
      success: true,
      source: 'redis_daily_service_v3_forced', // Force complete cache invalidation
      deploymentVersion: '2025-09-14-REDIS-FORCED',
      timestamp: Date.now(), // Force unique response
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
        participants: stats.totalParticipants
      }
    });

  } catch (error) {
    console.error('❌ Admin stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load admin stats',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}