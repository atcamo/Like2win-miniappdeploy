import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to process engagement events (Daily Reset Fixed)
 * Simulates engagement processing with daily reset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userFid, castHash, timestamp, authorFid } = body;

    console.log('🎯 Engagement event received (Daily Reset):', { 
      type, 
      userFid, 
      castHash, 
      timestamp: timestamp || 'current time' 
    });

    // Validate required fields
    if (!type || !userFid || !castHash) {
      return NextResponse.json(
        { error: 'Missing required fields: type, userFid, castHash' },
        { status: 400 }
      );
    }

    // Validate engagement type
    if (!['like', 'recast', 'comment'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid engagement type. Must be: like, recast, or comment' },
        { status: 400 }
      );
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Simulate successful engagement processing for daily reset
    if (type === 'like') {
      return NextResponse.json({
        success: true,
        message: 'Like processed - daily reset active',
        data: {
          ticketsAwarded: 1, // Always award 1 ticket for simulation
          totalTickets: 1,   // But reset means total is just what they earned today
          engagementType: type,
          userFid,
          raffleId: `daily-raffle-${todayStr}`,
          processedAt: today.toISOString(),
          dailyReset: true
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `${type} processing not yet implemented in daily reset mode`
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error processing engagement:', error);
    return NextResponse.json(
      { error: 'Internal server error processing engagement' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for engagement status information (Daily Reset)
 */
export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    return NextResponse.json({
      name: 'Like2Win Engagement Processor (Daily Reset)',
      description: 'Simulates engagement processing with daily reset behavior',
      status: 'daily_reset_active',
      currentRaffle: {
        id: `daily-raffle-${todayStr}`,
        weekPeriod: `Daily Raffle - ${todayStr}`,
        startDate: `${todayStr}T00:01:00.000Z`,
        endDate: endOfDay.toISOString(),
        isActive: true
      },
      endpoints: {
        'POST /api/engagement/process': 'Simulates engagement events for daily reset testing'
      },
      webhook: {
        url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/neynar`,
        events: ['reaction.created', 'cast.mentioned'],
        status: 'daily_reset_mode'
      },
      message: 'Daily reset active - engagement simulation enabled',
      timestamp: today.toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get engagement status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}