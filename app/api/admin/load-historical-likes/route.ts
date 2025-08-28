import { NextRequest, NextResponse } from 'next/server';
import { EngagementService } from '@/lib/services/engagementService';

/**
 * Admin endpoint to load historical likes from August 18 onwards
 * This should only be run once for the first raffle to give credit for past engagement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, dryRun = false } = body;

    // Default to August 18, 2024 if no start date provided
    const historyStartDate = startDate ? new Date(startDate) : new Date('2024-08-18T00:00:00.000Z');
    const historyEndDate = endDate ? new Date(endDate) : new Date();

    console.log('🔍 Loading historical likes:', {
      startDate: historyStartDate.toISOString(),
      endDate: historyEndDate.toISOString(),
      dryRun
    });

    // Get current active raffle
    const activeRaffle = await EngagementService.getCurrentRaffleInfo();
    
    if (!activeRaffle) {
      return NextResponse.json(
        { error: 'No active raffle found' },
        { status: 400 }
      );
    }

    // Simulate some historical engagement data
    // In a real implementation, you would:
    // 1. Query Neynar API for @Like2Win casts between historyStartDate and historyEndDate
    // 2. For each cast, get the likes using Neynar
    // 3. Process each like as historical engagement

    const historicalLikes = [
      // Example historical data - replace with real Neynar API calls
      {
        userFid: '432789', // Example user FID
        castHash: '0xhistorical1',
        timestamp: new Date('2024-08-20T10:00:00.000Z'),
        authorFid: '1206612' // Like2Win FID
      },
      {
        userFid: '432789',
        castHash: '0xhistorical2', 
        timestamp: new Date('2024-08-22T15:30:00.000Z'),
        authorFid: '1206612'
      },
      {
        userFid: '123456', // Different user
        castHash: '0xhistorical1',
        timestamp: new Date('2024-08-19T12:00:00.000Z'),
        authorFid: '1206612'
      }
    ];

    let processed = 0;
    let awarded = 0;
    let results = [];

    for (const like of historicalLikes) {
      try {
        // Process each historical like
        const result = await EngagementService.processLikeEvent({
          type: 'like',
          userFid: like.userFid,
          castHash: like.castHash,
          timestamp: like.timestamp,
          authorFid: like.authorFid
        });

        results.push({
          userFid: like.userFid,
          castHash: like.castHash,
          timestamp: like.timestamp.toISOString(),
          success: result.success,
          message: result.message,
          ticketsAwarded: result.ticketsAwarded || 0
        });

        processed++;
        if (result.success && result.ticketsAwarded && result.ticketsAwarded > 0) {
          awarded += result.ticketsAwarded;
        }

      } catch (error) {
        console.error('Error processing historical like:', error);
        results.push({
          userFid: like.userFid,
          castHash: like.castHash,
          timestamp: like.timestamp.toISOString(),
          success: false,
          message: 'Processing error',
          ticketsAwarded: 0
        });
        processed++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalLikes: historicalLikes.length,
        processed,
        ticketsAwarded: awarded,
        period: {
          start: historyStartDate.toISOString(),
          end: historyEndDate.toISOString()
        },
        activeRaffle: activeRaffle.weekPeriod,
        dryRun
      },
      results,
      message: `Processed ${processed} historical likes, awarded ${awarded} tickets total`
    });

  } catch (error) {
    console.error('❌ Error loading historical likes:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}