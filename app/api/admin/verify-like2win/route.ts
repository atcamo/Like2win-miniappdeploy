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

    // Test different reaction endpoints with a recent post
    let reactionTests = [];
    if (recentCasts && recentCasts.length > 0) {
      const testHash = recentCasts[0].hash;
      console.log(`🧪 Testing reaction endpoints with hash: ${testHash}`);
      
      // Test 1: /v2/farcaster/cast/reactions/ with cast_hash parameter
      try {
        const url1 = `https://api.neynar.com/v2/farcaster/cast/reactions/?cast_hash=${testHash}&types=likes&limit=10`;
        const response1 = await fetch(url1, {
          headers: { 'accept': 'application/json', 'api_key': NEYNAR_API_KEY }
        });
        reactionTests.push({
          test: 'v2/reactions/ with cast_hash',
          url: url1,
          status: response1.status,
          ok: response1.ok,
          data: response1.ok ? await response1.json() : await response1.text()
        });
      } catch (error) {
        reactionTests.push({
          test: 'v2/reactions/ with cast_hash',
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Test 2: /v2/farcaster/cast/reactions without trailing slash
      try {
        const url2 = `https://api.neynar.com/v2/farcaster/cast/reactions?cast_hash=${testHash}&types=likes&limit=10`;
        const response2 = await fetch(url2, {
          headers: { 'accept': 'application/json', 'api_key': NEYNAR_API_KEY }
        });
        reactionTests.push({
          test: 'v2/reactions without slash',
          url: url2,
          status: response2.status,
          ok: response2.ok,
          data: response2.ok ? await response2.json() : await response2.text()
        });
      } catch (error) {
        reactionTests.push({
          test: 'v2/reactions without slash',
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Test 3: Try with hash parameter instead of cast_hash
      try {
        const url3 = `https://api.neynar.com/v2/farcaster/cast/reactions?hash=${testHash}&types=likes&limit=10`;
        const response3 = await fetch(url3, {
          headers: { 'accept': 'application/json', 'api_key': NEYNAR_API_KEY }
        });
        reactionTests.push({
          test: 'v2/reactions with hash param',
          url: url3,
          status: response3.status,
          ok: response3.ok,
          data: response3.ok ? await response3.json() : await response3.text()
        });
      } catch (error) {
        reactionTests.push({
          test: 'v2/reactions with hash param',
          error: error instanceof Error ? error.message : String(error)
        });
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
        reactionTests,
        currentFidInCode: 1206612,
        recommendations: {
          correctFid: userData?.user?.fid || fidData?.users?.[0]?.fid,
          hasRecentActivity: recentCasts && recentCasts.length > 0,
          accountExists: !!(userData?.user || fidData?.users?.[0]),
          workingReactionEndpoint: reactionTests.find(t => t.ok)?.url || 'None found'
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