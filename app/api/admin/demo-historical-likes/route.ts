import { NextRequest, NextResponse } from 'next/server';
import { engagementService } from '@/lib/services/engagement-service';

/**
 * Demo endpoint to show historical likes loading functionality
 * Works without database connection to demonstrate the feature
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, dryRun = true } = body;

    const historyStartDate = startDate ? new Date(startDate) : new Date('2025-08-18T00:00:00.000Z');
    const historyEndDate = endDate ? new Date(endDate) : new Date();

    console.log('🔍 Demo: Loading historical likes:', {
      startDate: historyStartDate.toISOString(),
      endDate: historyEndDate.toISOString(),
      dryRun
    });

    // Mock active raffle data
    const mockActiveRaffle = {
      id: 'demo-raffle-id',
      weekPeriod: 'Week 34-37 2025 (Launch Raffle)',
      startDate: new Date('2025-08-18T00:00:00.000Z'),
      endDate: new Date('2025-09-15T23:59:59.000Z'),
      status: 'ACTIVE',
      totalTickets: 0,
      totalParticipants: 0
    };

    console.log('📊 Demo: Using mock active raffle:', mockActiveRaffle.weekPeriod);

    // Check if engagement service is available
    if (!engagementService.isInitialized()) {
      console.log('⚠️ Engagement service not initialized, creating mock Like2Win casts');
      
      // Mock historical likes data showing what would be processed
      const mockHistoricalLikes = [
        {
          userFid: '432789',
          castHash: '0xdemo1a2b3c',
          timestamp: new Date('2025-08-20T10:00:00.000Z'),
          authorFid: '1206612',
          castText: '🎯 Like2Win Launch! Follow and like to participate...',
          reactionType: 'like'
        },
        {
          userFid: '567890',
          castHash: '0xdemo1a2b3c',
          timestamp: new Date('2025-08-20T11:30:00.000Z'),
          authorFid: '1206612',
          castText: '🎯 Like2Win Launch! Follow and like to participate...',
          reactionType: 'like'
        },
        {
          userFid: '432789',
          castHash: '0xdemo4d5e6f',
          timestamp: new Date('2025-08-22T15:30:00.000Z'),
          authorFid: '1206612',
          castText: '💰 Bi-weekly $DEGEN raffle is LIVE! Participate now...',
          reactionType: 'like'
        },
        {
          userFid: '789123',
          castHash: '0xdemo4d5e6f',
          timestamp: new Date('2025-08-22T16:00:00.000Z'),
          authorFid: '1206612',
          castText: '💰 Bi-weekly $DEGEN raffle is LIVE! Participate now...',
          reactionType: 'like'
        },
        {
          userFid: '567890',
          castHash: '0xdemo7g8h9i',
          timestamp: new Date('2025-08-25T12:00:00.000Z'),
          authorFid: '1206612',
          castText: '🚀 Like2Win gamification is here! Simple engagement...',
          reactionType: 'like'
        }
      ];

      console.log(`📥 Demo: Found ${mockHistoricalLikes.length} historical likes to process`);

      let processed = 0;
      let awarded = 0;
      let results = [];

      // Simulate processing each historical like
      for (const like of mockHistoricalLikes) {
        // Simulate ticket awarding logic
        const mockResult = {
          success: true,
          message: `Demo: Would award ticket for like during ${mockActiveRaffle.weekPeriod}`,
          ticketsAwarded: 1
        };

        results.push({
          userFid: like.userFid,
          castHash: like.castHash,
          castText: like.castText,
          timestamp: like.timestamp.toISOString(),
          success: mockResult.success,
          message: mockResult.message,
          ticketsAwarded: mockResult.ticketsAwarded || 0
        });

        processed++;
        if (mockResult.success && mockResult.ticketsAwarded && mockResult.ticketsAwarded > 0) {
          awarded += mockResult.ticketsAwarded;
        }
      }

      return NextResponse.json({
        success: true,
        demo: true,
        summary: {
          castsProcessed: 3, // 3 unique casts
          totalLikes: mockHistoricalLikes.length,
          processed,
          ticketsAwarded: awarded,
          period: {
            start: historyStartDate.toISOString(),
            end: historyEndDate.toISOString()
          },
          activeRaffle: mockActiveRaffle.weekPeriod,
          dryRun
        },
        results,
        message: `🎯 DEMO: Processed 3 Like2Win casts, found ${mockHistoricalLikes.length} historical likes, would award ${awarded} tickets total`,
        note: 'This is a demonstration showing how historical likes would be loaded and processed. In production, this would connect to the database and actually award tickets.'
      });
    }

    // If engagement service is available, try to get real Like2Win casts
    console.log('🔍 Engagement service available, fetching real Like2Win casts...');
    
    const like2winCasts = await engagementService.getLike2WinCasts(10);
    console.log(`📋 Found ${like2winCasts.length} Like2Win casts`);

    if (like2winCasts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No Like2Win casts found',
        like2winFid: engagementService.getLike2WinFid()
      });
    }

    // Simulate getting reactions for each cast
    let totalHistoricalLikes = 0;
    let castsInRange = 0;
    let castSummary = [];

    for (const cast of like2winCasts.slice(0, 3)) { // Limit to first 3 for demo
      const castDate = new Date(cast.timestamp);
      
      if (castDate >= historyStartDate && castDate <= historyEndDate) {
        castsInRange++;
        console.log(`📅 Cast in range: ${cast.hash} from ${castDate.toISOString()}`);
        
        // Mock getting reactions (in production this would call the API)
        const mockReactionsCount = Math.floor(Math.random() * 10) + 5; // 5-15 likes per cast
        totalHistoricalLikes += mockReactionsCount;
        
        castSummary.push({
          hash: cast.hash,
          text: cast.text?.substring(0, 100) + '...',
          timestamp: castDate.toISOString(),
          mockLikes: mockReactionsCount
        });
      }
    }

    return NextResponse.json({
      success: true,
      demo: true,
      summary: {
        castsProcessed: castsInRange,
        totalLikes: totalHistoricalLikes,
        processed: totalHistoricalLikes,
        ticketsAwarded: totalHistoricalLikes, // 1 ticket per like
        period: {
          start: historyStartDate.toISOString(),
          end: historyEndDate.toISOString()
        },
        activeRaffle: mockActiveRaffle.weekPeriod,
        like2winFid: engagementService.getLike2WinFid(),
        dryRun
      },
      casts: castSummary,
      message: `🎯 DEMO: Found ${castsInRange} Like2Win casts in date range, would process ${totalHistoricalLikes} historical likes`,
      note: 'This demonstration shows real Like2Win casts but simulates the like processing. In production with database connectivity, this would actually award tickets.'
    });

  } catch (error) {
    console.error('❌ Error in demo historical likes:', error);
    return NextResponse.json(
      { 
        error: 'Demo error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}