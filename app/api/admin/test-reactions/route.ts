import { NextRequest, NextResponse } from 'next/server';

/**
 * Test specific cast reactions to debug why likes aren't being detected
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const castHash = searchParams.get('hash') || '0x352223eced8e4a8016329d0df484174ba78c6f06'; // Default to recent cast
    
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({
        error: 'NEYNAR_API_KEY not configured'
      }, { status: 400 });
    }

    console.log(`🔍 Testing reactions for cast: ${castHash}`);

    // Test 1: Get cast info
    console.log('📱 Step 1: Getting cast info...');
    const castResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    let castData = null;
    if (castResponse.ok) {
      castData = await castResponse.json();
    }

    // Test 2: Get reactions with different parameters
    console.log('❤️ Step 2: Getting reactions (likes only)...');
    const reactionsResponse1 = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?hash=${castHash}&types=likes&limit=100`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    let reactionsData1 = null;
    if (reactionsResponse1.ok) {
      reactionsData1 = await reactionsResponse1.json();
    }

    // Test 3: Get reactions with identifier parameter
    console.log('🔄 Step 3: Getting reactions (all types)...');
    const reactionsResponse2 = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?identifier=${castHash}&type=hash&limit=100`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    let reactionsData2 = null;
    if (reactionsResponse2.ok) {
      reactionsData2 = await reactionsResponse2.json();
    }

    // Test 4: Try the reactions endpoint from cast data
    let directReactions = null;
    if (castData?.cast?.reactions) {
      directReactions = castData.cast.reactions;
    }

    return NextResponse.json({
      success: true,
      testCast: castHash,
      timestamp: new Date().toISOString(),
      tests: {
        castInfo: {
          success: castResponse.ok,
          status: castResponse.status,
          data: castData ? {
            hash: castData.cast?.hash,
            author: castData.cast?.author?.username,
            text: castData.cast?.text?.substring(0, 100),
            reactions: castData.cast?.reactions,
            likes_count: castData.cast?.reactions?.likes_count,
            recasts_count: castData.cast?.reactions?.recasts_count
          } : null
        },
        reactionsLikesOnly: {
          success: reactionsResponse1.ok,
          status: reactionsResponse1.status,
          data: reactionsData1 ? {
            total_likes: reactionsData1.reactions?.likes?.length || 0,
            likes: reactionsData1.reactions?.likes?.slice(0, 3).map((like: any) => ({
              user_fid: like.user?.fid,
              username: like.user?.username,
              timestamp: like.timestamp
            })) || []
          } : null,
          error: !reactionsResponse1.ok ? await reactionsResponse1.text() : null
        },
        reactionsAllTypes: {
          success: reactionsResponse2.ok,
          status: reactionsResponse2.status,
          data: reactionsData2 ? {
            total_reactions: Object.keys(reactionsData2.reactions || {}).length,
            types: Object.keys(reactionsData2.reactions || {}),
            sample: reactionsData2
          } : null,
          error: !reactionsResponse2.ok ? await reactionsResponse2.text() : null
        },
        directFromCast: {
          available: !!directReactions,
          data: directReactions
        }
      },
      analysis: {
        castExists: !!castData,
        hasReactionCounts: !!(castData?.cast?.reactions?.likes_count),
        expectedLikes: castData?.cast?.reactions?.likes_count || 0,
        actualLikesFound: reactionsData1?.reactions?.likes?.length || 0,
        issueDetected: (castData?.cast?.reactions?.likes_count || 0) > 0 && (reactionsData1?.reactions?.likes?.length || 0) === 0
      },
      recommendations: []
    });

  } catch (error) {
    console.error('❌ Error testing reactions:', error);
    return NextResponse.json({
      error: 'Failed to test reactions',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * POST endpoint to test with a specific cast hash
 */
export async function POST(request: NextRequest) {
  try {
    const { castHash } = await request.json();
    
    if (!castHash) {
      return NextResponse.json({
        error: 'castHash is required'
      }, { status: 400 });
    }

    // Redirect to GET with the cast hash
    const url = new URL(request.url);
    url.searchParams.set('hash', castHash);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: request.headers
    });
    
    return response;

  } catch (error) {
    console.error('❌ Error in POST test reactions:', error);
    return NextResponse.json({
      error: 'Failed to test reactions via POST',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}