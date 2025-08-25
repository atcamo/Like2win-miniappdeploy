import { NextRequest, NextResponse } from 'next/server';

/**
 * Test scan with detailed logging to debug why likes aren't being detected
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Starting test scan with detailed logging...');

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({
        error: 'NEYNAR_API_KEY not configured'
      }, { status: 400 });
    }

    // 1. Get recent posts from @Like2Win (just 2 for testing)
    console.log('📱 Fetching recent @Like2Win posts...');
    const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=1206612&limit=2`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    if (!castsResponse.ok) {
      const errorText = await castsResponse.text();
      return NextResponse.json({
        error: `Failed to fetch Like2Win posts: ${castsResponse.status}`,
        details: errorText
      }, { status: 500 });
    }

    const castsData = await castsResponse.json();
    const posts = castsData.casts || [];
    
    console.log(`📋 Found ${posts.length} recent posts from @Like2Win`);

    const results = [];

    // 2. For each post, test different reaction endpoints
    for (const post of posts.slice(0, 1)) { // Just test first post
      console.log(`\n🔍 Testing post: ${post.hash}`);
      console.log(`📝 Post content: "${post.text.substring(0, 100)}..."`);
      console.log(`📊 Post reactions from feed: ${JSON.stringify(post.reactions, null, 2)}`);

      const postResult: any = {
        hash: post.hash,
        text: post.text.substring(0, 100),
        feedReactions: post.reactions,
        apiTests: {}
      };

      // Test 1: WORKING v2 reactions endpoint
      try {
        console.log('🧪 Test 1: WORKING reactions/cast endpoint...');
        const reactionsResponse1 = await fetch(`https://api.neynar.com/v2/farcaster/reactions/cast?hash=${post.hash}&types=likes&limit=25`, {
          headers: {
            'accept': 'application/json',
            'api_key': NEYNAR_API_KEY
          }
        });

        console.log(`Response status: ${reactionsResponse1.status}`);
        
        if (reactionsResponse1.ok) {
          const reactionsData1 = await reactionsResponse1.json();
          postResult.apiTests.workingEndpoint = {
            status: reactionsResponse1.status,
            success: true,
            data: reactionsData1,
            likesFound: reactionsData1.reactions?.length || 0
          };
          console.log(`✅ Success! Found ${reactionsData1.reactions?.length || 0} likes`);
        } else {
          const errorText = await reactionsResponse1.text();
          postResult.apiTests.workingEndpoint = {
            status: reactionsResponse1.status,
            success: false,
            error: errorText
          };
          console.log(`❌ Failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Error in test 1: ${error}`);
        postResult.apiTests.workingEndpoint = {
          error: error instanceof Error ? error.message : String(error)
        };
      }

      // Test 2: Alternative v2 endpoint format
      try {
        console.log('🧪 Test 2: reactions endpoint without slash...');
        const reactionsResponse2 = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?cast_hash=${post.hash}&types=likes&limit=25`, {
          headers: {
            'accept': 'application/json',
            'api_key': NEYNAR_API_KEY
          }
        });

        console.log(`Response status: ${reactionsResponse2.status}`);
        
        if (reactionsResponse2.ok) {
          const reactionsData2 = await reactionsResponse2.json();
          postResult.apiTests.hashEndpoint = {
            status: reactionsResponse2.status,
            success: true,
            data: reactionsData2,
            likesFound: reactionsData2.reactions?.likes?.length || 0
          };
          console.log(`✅ Success! Found ${reactionsData2.reactions?.likes?.length || 0} likes`);
        } else {
          const errorText = await reactionsResponse2.text();
          postResult.apiTests.hashEndpoint = {
            status: reactionsResponse2.status,
            success: false,
            error: errorText
          };
          console.log(`❌ Failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Error in test 2: ${error}`);
        postResult.apiTests.hashEndpoint = {
          error: error instanceof Error ? error.message : String(error)
        };
      }

      results.push(postResult);
    }

    return NextResponse.json({
      success: true,
      message: 'Test scan completed',
      data: {
        postsAnalyzed: results.length,
        results,
        summary: {
          hasNeynarApiKey: true,
          foundPosts: posts.length > 0,
          testedEndpoints: 2
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in test scan:', error);
    return NextResponse.json({
      error: 'Failed to run test scan',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}