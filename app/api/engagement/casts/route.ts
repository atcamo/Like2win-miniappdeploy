import { NextRequest, NextResponse } from 'next/server';
import { engagementService } from '@/lib/services/engagement-service';

// GET /api/engagement/casts?limit=10
// Get Like2Win official casts for engagement
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!engagementService.isInitialized()) {
      return NextResponse.json(
        { error: 'Engagement service not available' },
        { status: 503 }
      );
    }

    const casts = await engagementService.getLike2WinCasts(limit);

    // Format casts for frontend consumption
    const formattedCasts = casts.map(cast => ({
      hash: cast.hash,
      text: cast.text,
      timestamp: cast.timestamp,
      author: {
        fid: cast.author.fid,
        username: cast.author.username,
        displayName: cast.author.display_name,
        pfp: cast.author.pfp_url
      },
      engagement: {
        likes: cast.reactions?.likes_count || 0,
        recasts: cast.reactions?.recasts_count || 0,
        replies: cast.replies?.count || 0
      },
      embeds: cast.embeds || []
    }));

    return NextResponse.json({
      success: true,
      data: {
        casts: formattedCasts,
        like2winFid: engagementService.getLike2WinFid(),
        total: formattedCasts.length
      }
    });

  } catch (error) {
    console.error('Error fetching Like2Win casts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}