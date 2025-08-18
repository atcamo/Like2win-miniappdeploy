import { NextRequest, NextResponse } from 'next/server';
import { engagementService } from '@/lib/services/engagement-service';

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

    // Ensure engagement service is initialized
    if (!engagementService.isInitialized()) {
      return NextResponse.json(
        { error: 'Engagement service not available' },
        { status: 503 }
      );
    }

    // Process engagement
    const result = await engagementService.processEngagementForTicket(
      parseInt(userFid), 
      castHash
    );

    return NextResponse.json({
      success: true,
      data: result
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

    if (!engagementService.isInitialized()) {
      return NextResponse.json(
        { error: 'Engagement service not available' },
        { status: 503 }
      );
    }

    // Check eligibility only
    const eligibility = await engagementService.checkTicketEligibility(
      parseInt(userFid), 
      castHash
    );

    return NextResponse.json({
      success: true,
      data: eligibility
    });

  } catch (error) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}