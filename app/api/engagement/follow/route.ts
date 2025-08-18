import { NextRequest, NextResponse } from 'next/server';
import { engagementService } from '@/lib/services/engagement-service';

// GET /api/engagement/follow?userFid=123
// Check if user follows @Like2Win
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userFid = searchParams.get('userFid');

    if (!userFid) {
      return NextResponse.json(
        { error: 'userFid is required' },
        { status: 400 }
      );
    }

    if (!engagementService.isInitialized()) {
      return NextResponse.json(
        { error: 'Engagement service not available' },
        { status: 503 }
      );
    }

    const isFollowing = await engagementService.checkUserFollowsLike2Win(
      parseInt(userFid)
    );

    return NextResponse.json({
      success: true,
      data: {
        userFid: parseInt(userFid),
        isFollowing,
        like2winFid: engagementService.getLike2WinFid()
      }
    });

  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/engagement/follow
// Manually trigger follow check and update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userFid } = body;

    if (!userFid) {
      return NextResponse.json(
        { error: 'userFid is required' },
        { status: 400 }
      );
    }

    if (!engagementService.isInitialized()) {
      return NextResponse.json(
        { error: 'Engagement service not available' },
        { status: 503 }
      );
    }

    // Force check and update follow status
    const isFollowing = await engagementService.checkUserFollowsLike2Win(
      parseInt(userFid)
    );

    return NextResponse.json({
      success: true,
      data: {
        userFid: parseInt(userFid),
        isFollowing,
        message: isFollowing ? 'User is following @Like2Win' : 'User is not following @Like2Win'
      }
    });

  } catch (error) {
    console.error('Error updating follow status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}