import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin API to verify @Like2Win account details and FID
 */
export async function GET(request: NextRequest) {
  try {
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({
        error: 'NEYNAR_API_KEY not configured',
        message: 'Cannot verify without Neynar API access'
      }, { status: 400 });
    }

    console.log('🔍 Verifying @Like2Win account details...');

    // Try to get user info by username
    const userResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/by_username?username=like2win`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    let userData = null;
    if (userResponse.ok) {
      userData = await userResponse.json();
    }

    // Also try the FID we think is correct
    const fidResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=1206612`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    let fidData = null;
    if (fidResponse.ok) {
      fidData = await fidResponse.json();
    }

    // Try to get recent casts to see activity
    let recentCasts = null;
    if (userData?.user?.fid) {
      const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${userData.user.fid}&limit=5`, {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY
        }
      });

      if (castsResponse.ok) {
        const castsData = await castsResponse.json();
        recentCasts = castsData.casts?.map((cast: any) => ({
          hash: cast.hash,
          text: cast.text.substring(0, 100),
          timestamp: cast.timestamp,
          likes: cast.reactions?.likes_count || 0,
          replies: cast.replies?.count || 0
        }));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        byUsername: userData ? {
          fid: userData.user?.fid,
          username: userData.user?.username,
          displayName: userData.user?.display_name,
          followerCount: userData.user?.follower_count,
          followingCount: userData.user?.following_count,
          pfpUrl: userData.user?.pfp_url,
          verified: userData.user?.power_badge
        } : null,
        byFid: fidData ? fidData.users?.[0] ? {
          fid: fidData.users[0].fid,
          username: fidData.users[0].username,
          displayName: fidData.users[0].display_name,
          followerCount: fidData.users[0].follower_count,
          followingCount: fidData.users[0].following_count,
          pfpUrl: fidData.users[0].pfp_url,
          verified: fidData.users[0].power_badge
        } : null : null,
        recentCasts,
        currentFidInCode: 1206612,
        recommendations: {
          correctFid: userData?.user?.fid || fidData?.users?.[0]?.fid,
          hasRecentActivity: recentCasts && recentCasts.length > 0,
          accountExists: !!(userData?.user || fidData?.users?.[0])
        }
      }
    });

  } catch (error) {
    console.error('❌ Error verifying Like2Win account:', error);
    return NextResponse.json({
      error: 'Failed to verify account',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}