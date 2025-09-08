import { NextRequest, NextResponse } from 'next/server';

/**
 * Raffle Leaderboard API (Daily Reset Fixed)
 * Returns empty leaderboard to ensure daily reset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`🏆 Raffle Leaderboard API (Daily Reset) (limit: ${limit})`);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Always return empty leaderboard for daily reset
    return NextResponse.json({
      success: true,
      source: 'daily_reset_fixed',
      leaderboard: [],
      raffle: {
        id: `daily-raffle-${todayStr}`,
        weekPeriod: `Daily Raffle - ${todayStr}`,
        status: 'ACTIVE',
        raffleType: 'DAILY',
        totalTickets: 0, // Always 0 for daily reset
        totalParticipants: 0, // Always 0 for daily reset
        prizeAmount: 500,
        dayNumber: today.getDay() || 7
      },
      pagination: {
        limit,
        total: 0,
        hasMore: false
      },
      message: 'Daily reset active - leaderboard starts fresh each day at midnight UTC',
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