import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint without external dependencies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fidParam = searchParams.get('fid');
    
    if (!fidParam) {
      return NextResponse.json(
        { error: 'FID parameter is required' },
        { status: 400 }
      );
    }

    // Mock response for testing
    const response = {
      success: true,
      data: {
        raffle: {
          id: 'test-raffle-id',
          weekPeriod: '2025-W03',
          prizePool: 50000,
          totalParticipants: 0,
          totalTickets: 0,
          endDate: new Date('2025-01-26T23:59:59Z').toISOString(),
          timeUntilEnd: '5d 12h',
          isSelfSustaining: false
        },
        user: {
          fid: fidParam,
          username: null,
          displayName: null,
          currentTickets: 0,
          probability: 0,
          tipAllowanceEnabled: false,
          isFollowing: false,
          totalLifetimeTickets: 0,
          totalWinnings: 0
        },
        lastWinners: []
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in status-direct endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}