import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleRedisService } from '@/lib/services/dailyRaffleRedisService';
import { dailyRaffleService } from '@/lib/services/dailyRaffleService';

/**
 * Raffle Status API (Daily Reset Fixed)
 * Returns current raffle status using daily service
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFid = searchParams.get('fid');

    console.log(`🎯 Raffle Status API (Daily Reset): ${userFid ? `User ${userFid}` : 'General status'}`);

    // Use Redis if available, fallback to in-memory for local development
    const isRedisAvailable = process.env.REDIS_URL && process.env.REDIS_URL.startsWith('https');
    
    let raffleInfo, stats, userTickets;
    
    if (isRedisAvailable) {
      // Get raffle info and stats from daily Redis service
      raffleInfo = dailyRaffleRedisService.getRaffleInfo();
      stats = await dailyRaffleRedisService.getTotalStats();
      userTickets = userFid ? await dailyRaffleRedisService.getUserTickets(parseInt(userFid)) : null;
    } else {
      // Get raffle info and stats from daily in-memory service (local dev)
      raffleInfo = dailyRaffleService.getRaffleInfo();
      stats = dailyRaffleService.getTotalStats();
      userTickets = userFid ? dailyRaffleService.getUserTickets(parseInt(userFid)) : null;
    }

    const response = {
      success: true,
      source: 'daily_reset_fixed',
      raffle: {
        id: raffleInfo.id,
        weekPeriod: raffleInfo.weekPeriod,
        raffleType: 'DAILY',
        status: raffleInfo.status,
        startDate: raffleInfo.startDate,
        endDate: raffleInfo.endDate,
        prizeAmount: 500,
        totalPool: 500,
        totalTickets: stats.totalTickets,
        totalParticipants: stats.totalParticipants,
        dayNumber: new Date().getDay() || 7,
        timeRemaining: raffleInfo.timeRemaining
      },
      user: userFid ? {
        fid: parseInt(userFid),
        tickets: userTickets?.tickets || 0,
        displayName: `User ${userFid}`,
        username: `user_${userFid}`,
        isFollowing: false,
        engagementCount: userTickets?.engagements.length || 0,
        lastActivity: userTickets?.lastActivity || null
      } : null,
      timestamp: new Date().toISOString(),
      message: `Daily reset active - ${stats.totalTickets} tickets, ${stats.totalParticipants} participants today`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Raffle status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}