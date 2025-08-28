import { NextRequest, NextResponse } from 'next/server';
import { EngagementService } from '@/lib/services/engagementService';

// POST /api/engagement/check
// Check user engagement and award tickets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userFid, castHash } = body;

    if (!userFid || !castHash) {
      return NextResponse.json(
        { error: 'userFid and castHash are required' },
        { status: 400 }
      );
    }

    console.log('🎫 Processing engagement check:', { userFid, castHash });

    // Process engagement using the new EngagementService
    const result = await EngagementService.processLikeEvent({
      type: 'like',
      userFid: userFid.toString(),
      castHash: castHash,
      timestamp: new Date(),
      authorFid: '1206612' // Like2Win FID
    });

    return NextResponse.json({
      success: result.success,
      ticketAwarded: result.success && result.ticketsAwarded && result.ticketsAwarded > 0,
      message: result.message,
      userTickets: result.totalTickets || 0
    });

  } catch (error) {
    console.error('Error processing engagement check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/engagement/check?userFid=123&castHash=0x...
// Check eligibility without awarding ticket
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userFid = searchParams.get('userFid');
    const castHash = searchParams.get('castHash');

    if (!userFid || !castHash) {
      return NextResponse.json(
        { error: 'userFid and castHash are required' },
        { status: 400 }
      );
    }

    console.log('🎯 Checking eligibility for:', { userFid, castHash });

    // For now, return eligibility based on active raffle
    const activeRaffle = await EngagementService.getCurrentRaffleInfo();
    
    if (!activeRaffle) {
      return NextResponse.json({
        success: true,
        isEligibleForTicket: false,
        message: 'No active raffle'
      });
    }

    // Simple check: if raffle exists, user is eligible (for now)
    return NextResponse.json({
      success: true,
      isEligibleForTicket: true,
      message: `Can participate in ${activeRaffle.weekPeriod}`
    });

  } catch (error) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}