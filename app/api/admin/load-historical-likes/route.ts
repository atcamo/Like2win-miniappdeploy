import { NextRequest, NextResponse } from 'next/server';
import { EngagementService } from '@/lib/services/engagementService';
import { engagementService } from '@/lib/services/engagement-service';

/**
 * Admin endpoint to load historical likes from August 18 onwards
 * This should only be run once for the first raffle to give credit for past engagement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, dryRun = false } = body;

    // Default to August 18, 2025 if no start date provided
    const historyStartDate = startDate ? new Date(startDate) : new Date('2025-08-18T00:00:00.000Z');
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

    // Get real historical likes from Like2Win publications
    console.log('📥 Fetching Like2Win historical casts and their likes...');
    
    if (!engagementService.isInitialized()) {
      return NextResponse.json(
        { error: 'Engagement service not available - cannot fetch historical likes' },
        { status: 503 }
      );
    }

    // Fetch Like2Win casts from the historical period
    const like2winCasts = await engagementService.getLike2WinCasts(50); // Get more casts for historical data
    console.log(`🔍 Found ${like2winCasts.length} Like2Win casts`);

    let historicalLikes: any[] = [];
    let castsProcessed = 0;
    
    // For each cast, get its reactions (likes)
    for (const cast of like2winCasts) {
      try {
        const castDate = new Date(cast.timestamp);
        
        // Skip if cast is outside our historical period
        if (castDate < historyStartDate || castDate > historyEndDate) {
          continue;
        }
        
        console.log(`📋 Processing cast ${cast.hash} from ${castDate.toISOString()}`);
        
        // Get reactions for this cast using Neynar
        const reactions = await engagementService.getCastReactions(cast.hash, 'likes');
        
        if (reactions && reactions.length > 0) {
          console.log(`   👍 Found ${reactions.length} likes on this cast`);
          
          // Add each like as historical engagement
          for (const reaction of reactions) {
            historicalLikes.push({
              userFid: reaction.user.fid.toString(),
              castHash: cast.hash,
              timestamp: new Date(reaction.timestamp),
              authorFid: engagementService.getLike2WinFid().toString(),
              castText: cast.text.substring(0, 100) + '...',
              reactionType: 'like'
            });
          }
        } else {
          console.log(`   ⚠️ No likes found for cast ${cast.hash}`);
        }
        
        castsProcessed++;
        
        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Error processing cast ${cast.hash}:`, error);
        continue;
      }
    }
    
    console.log(`📊 Summary: ${castsProcessed} casts processed, ${historicalLikes.length} historical likes found`);

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
        castsProcessed,
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
      message: `🎯 Processed ${castsProcessed} Like2Win casts, found ${historicalLikes.length} historical likes, awarded ${awarded} tickets total`
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