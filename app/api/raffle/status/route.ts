import { NextRequest, NextResponse } from 'next/server';
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

    // Get raffle info and stats from daily service
    const raffleInfo = dailyRaffleService.getRaffleInfo();
    const userTickets = userFid ? dailyRaffleService.getUserTickets(parseInt(userFid)) : null;

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
        totalTickets: raffleInfo.totalTickets,
        totalParticipants: raffleInfo.totalParticipants,
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
      message: `Daily reset active - ${raffleInfo.totalTickets} tickets, ${raffleInfo.totalParticipants} participants today`
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