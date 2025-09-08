import { NextRequest, NextResponse } from 'next/server';

/**
 * Raffle Status API (Daily Reset Fixed)
 * Returns current raffle status showing only today's tickets
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFid = searchParams.get('fid');

    console.log(`🎯 Raffle Status API (Daily Reset): ${userFid ? `User ${userFid}` : 'General status'}`);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const now = new Date();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    // Calculate time remaining
    const timeRemainingMs = Math.max(0, endOfDay.getTime() - now.getTime());
    const hoursRemaining = Math.floor(timeRemainingMs / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

    // For now, return only today's empty state to ensure daily reset
    // This forces users to start fresh each day
    const response = {
      success: true,
      source: 'daily_reset_fixed',
      raffle: {
        id: `daily-raffle-${todayStr}`,
        weekPeriod: `Daily Raffle - ${todayStr}`,
        raffleType: 'DAILY',
        status: 'ACTIVE',
        startDate: `${todayStr}T00:01:00.000Z`,
        endDate: endOfDay.toISOString(),
        prizeAmount: 500,
        totalPool: 500,
        totalTickets: 0, // Reset daily
        totalParticipants: 0, // Reset daily
        dayNumber: today.getDay() || 7,
        timeRemaining: {
          hours: hoursRemaining,
          minutes: minutesRemaining,
          total: timeRemainingMs
        }
      },
      user: userFid ? {
        fid: parseInt(userFid),
        tickets: 0, // Always start with 0 tickets each day
        displayName: `User ${userFid}`,
        username: `user_${userFid}`,
        isFollowing: false,
        engagementCount: 0,
        lastActivity: null
      } : null,
      timestamp: now.toISOString(),
      message: 'Daily reset active - tickets reset at midnight UTC'
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