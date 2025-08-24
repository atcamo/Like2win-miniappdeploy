import { NextRequest, NextResponse } from 'next/server';
import { EngagementService } from '@/lib/services/engagementService';

/**
 * Real Participation API
 * Processes user engagement and awards tickets using the real EngagementService
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_fid, post_cast_hash, engagement_type, engagement_data } = body;

    // Validate required fields
    if (!user_fid || !post_cast_hash) {
      return NextResponse.json(
        { error: 'Missing required fields: user_fid, post_cast_hash' },
        { status: 400 }
      );
    }

    console.log('🎫 Processing participation request:', {
      userFid: user_fid,
      castHash: post_cast_hash,
      engagementType: engagement_type,
      engagementData: engagement_data
    });

    // Use EngagementService to process the like
    const result = await EngagementService.processLikeEvent({
      type: 'like', // For now, focus on likes
      userFid: user_fid.toString(),
      castHash: post_cast_hash,
      timestamp: new Date(),
      authorFid: '1206612' // Like2Win FID
    });

    // Return response in expected format
    const response = {
      success: result.success,
      data: {
        ticketAwarded: result.success && result.ticketsAwarded && result.ticketsAwarded > 0,
        requiredActions: result.success ? [] : ['like'],
        userTickets: result.totalTickets || 0,
        message: result.message,
        engagement: {
          hasLiked: result.success,
          hasCommented: false, // TODO: Implement comment detection
          hasRecasted: false, // TODO: Implement recast detection
          hasTipAllowance: engagement_data?.tip_allowance || false
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in participation API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        data: {
          ticketAwarded: false,
          requiredActions: ['error'],
          userTickets: 0,
          message: 'Error processing participation'
        }
      },
      { status: 500 }
    );
  }
}