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

    console.log('🎯 status-direct API called with fid:', fidParam);
    
    // Mock response for testing - simulate user has some tickets after interaction
    const mockTickets = Math.floor(Math.random() * 3); // 0-2 tickets for testing
    
    const response = {
      success: true,
      data: {
        raffle: {
          id: 'test-raffle-id',
          weekPeriod: '2025-W03',
          prizePool: 50000,
          totalParticipants: 0,
          totalTickets: mockTickets,
          endDate: new Date('2025-01-26T23:59:59Z').toISOString(),
          timeUntilEnd: '5d 12h',
          isSelfSustaining: false
        },
        user: {
          fid: fidParam,
          username: null,
          displayName: null,
          currentTickets: mockTickets,
          probability: 0,
          tipAllowanceEnabled: true, // Enable tip allowance for easier testing
          isFollowing: true, // Mock as following
          totalLifetimeTickets: mockTickets,
          totalWinnings: 0
        },
        lastWinners: []
      }
    };
    
    console.log('📊 status-direct API response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in status-direct endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}