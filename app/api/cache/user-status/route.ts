import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleRedisService } from '@/lib/services/dailyRaffleRedisService';
import { dailyRaffleService } from '@/lib/services/dailyRaffleService';

/**
 * Cache-based User Status API (Daily Reset Fixed)
 * Returns fresh daily data with proper end times
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

    console.log(`🚀 Cache API (Daily Reset): Getting status for user ${userFid}`);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Use Redis if available, fallback to in-memory for local development
    const isRedisAvailable = process.env.REDIS_URL && process.env.REDIS_URL.startsWith('https');
    
    let userTickets, stats, raffleInfo;
    
    if (isRedisAvailable) {
      userTickets = await dailyRaffleRedisService.getUserTickets(parseInt(userFid));
      stats = await dailyRaffleRedisService.getTotalStats();
      raffleInfo = dailyRaffleRedisService.getRaffleInfo();
    } else {
      userTickets = dailyRaffleService.getUserTickets(parseInt(userFid));
      stats = dailyRaffleService.getTotalStats();
      raffleInfo = dailyRaffleService.getRaffleInfo();
    }

    const currentTickets = userTickets?.tickets || 0;
    const totalTickets = stats.totalTickets;
    const totalParticipants = stats.totalParticipants;

    // Return real data from raffle services
    return NextResponse.json({
      success: true,
      source: 'daily_reset_fixed',
      data: {
        user: {
          fid: parseInt(userFid),
          currentTickets: currentTickets,
          username: userTickets?.username || `user_${userFid}`,
          displayName: userTickets?.displayName || userTickets?.username || `User ${userFid}`,
          lastUpdated: userTickets?.lastActivity || null,
          probability: totalTickets > 0 ? (currentTickets / totalTickets) * 100 : 0,
          tipAllowanceEnabled: false,
          isFollowing: false,
          totalLifetimeTickets: currentTickets,
          totalWinnings: 0
        },
        raffle: {
          id: raffleInfo.id,
          weekPeriod: raffleInfo.weekPeriod,
          prizePool: 500,
          totalParticipants: totalParticipants,
          totalTickets: totalTickets,
          endDate: raffleInfo.endDate,
          timeUntilEnd: `${raffleInfo.timeRemaining.hours}h ${raffleInfo.timeRemaining.minutes}m`,
          isSelfSustaining: true,
          startDate: raffleInfo.startDate,
          status: raffleInfo.status
        },
        lastWinners: []
      },
      message: `Showing real data - ${currentTickets} tickets for user, ${totalTickets} total tickets`,
      timestamp: today.toISOString()
    });

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
 * POST endpoint for manual cache refresh (Daily Reset)
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

    console.log(`🔄 Manual cache refresh requested for user ${userFid} (Daily Reset)`);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Return same daily reset data
    return NextResponse.json({
      success: true,
      message: 'Daily reset active - no cache to refresh',
      data: {
        user: {
          fid: parseInt(userFid),
          currentTickets: 0,
          lastUpdated: today.toISOString()
        },
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