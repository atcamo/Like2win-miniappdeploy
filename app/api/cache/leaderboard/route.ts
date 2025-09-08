import { NextRequest, NextResponse } from 'next/server';

/**
 * Cache-based Leaderboard API (Daily Reset Fixed)
 * Returns empty leaderboard to ensure daily reset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`🏆 Cache API: Daily Reset Active (limit: ${limit})`);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Always return empty for daily reset - no cache, no local data
    return NextResponse.json({
      success: true,
      source: 'daily_reset_fixed',
      data: {
        leaderboard: [],
        raffle: {
          id: `daily-raffle-${todayStr}`,
          weekPeriod: `Daily Raffle - ${todayStr}`,
          totalTickets: 0,
          totalParticipants: 0
        }
      },
      message: 'Daily reset active - leaderboard cleared',
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