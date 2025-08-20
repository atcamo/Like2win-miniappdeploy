import { NextRequest, NextResponse } from 'next/server';

// Mock leaderboard endpoint to avoid Prisma conflicts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'current';
    
    // Mock leaderboard data
    const response = {
      success: true,
      data: {
        raffle: {
          id: 'test-raffle-id',
          weekPeriod: '2025-W03',
          status: 'ACTIVE',
          totalParticipants: 0,
          totalTickets: 0,
          prizePool: 50000,
          isSelfSustaining: false
        },
        leaderboard: [], // Empty initially
        meta: {
          totalEntries: 0,
          maxRank: 0
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in leaderboard mock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}