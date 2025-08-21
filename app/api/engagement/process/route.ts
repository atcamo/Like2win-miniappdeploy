import { NextRequest, NextResponse } from 'next/server';
import { EngagementService } from '../../../../lib/services/engagementService';

/**
 * API endpoint to process engagement events (likes, recasts, comments)
 * Only processes engagement during active raffle periods
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userFid, castHash, timestamp, authorFid } = body;

    console.log('🎯 Engagement event received:', { 
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

    // Use provided timestamp or current time
    const eventTimestamp = timestamp ? new Date(timestamp) : new Date();

    // Process the engagement based on type
    let result;
    
    if (type === 'like') {
      result = await EngagementService.processLikeEvent({
        type: 'like',
        userFid,
        castHash,
        timestamp: eventTimestamp,
        authorFid
      });
    } else {
      // For now, we only handle likes. Future versions can handle recasts/comments
      result = {
        success: false,
        message: `${type} processing not yet implemented`
      };
    }

    // Return result
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          ticketsAwarded: result.ticketsAwarded,
          totalTickets: result.totalTickets,
          engagementType: type,
          userFid,
          processedAt: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        engagementType: type,
        userFid
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
 * GET endpoint for engagement status information
 */
export async function GET(request: NextRequest) {
  try {
    // Get current active raffle info
    const activeRaffle = await EngagementService.getCurrentRaffleInfo();
    
    return NextResponse.json({
      name: 'Like2Win Engagement Processor',
      description: 'Processes likes during active raffle periods and awards tickets automatically',
      status: 'active',
      currentRaffle: activeRaffle ? {
        id: activeRaffle.id,
        weekPeriod: activeRaffle.weekPeriod,
        startDate: activeRaffle.startDate.toISOString(),
        endDate: activeRaffle.endDate.toISOString(),
        isActive: true
      } : null,
      endpoints: {
        'POST /api/engagement/process': 'Process real engagement events from Farcaster'
      },
      webhook: {
        url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/neynar`,
        events: ['reaction.created', 'cast.mentioned']
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get engagement status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}