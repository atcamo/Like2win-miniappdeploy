import { NextRequest, NextResponse } from 'next/server';
import { EngagementService } from '@/lib/services/engagementService';

/**
 * Admin API to scan existing likes on @Like2Win posts and award tickets retroactively
 * This is a temporary solution until the real-time webhook is configured
 */

const LIKE2WIN_USERNAME = 'like2win';
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting retroactive like scan for @Like2Win posts...');

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({
        error: 'NEYNAR_API_KEY not configured',
        message: 'Cannot scan likes without Neynar API access'
      }, { status: 400 });
    }

    // 1. Get recent posts from @Like2Win
    console.log('📱 Fetching recent @Like2Win posts...');
    const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=1206612&limit=10`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    if (!castsResponse.ok) {
      throw new Error(`Failed to fetch Like2Win posts: ${castsResponse.status}`);
    }

    const castsData = await castsResponse.json();
    const posts = castsData.casts || [];
    
    console.log(`📋 Found ${posts.length} recent posts from @Like2Win`);

    let totalLikesProcessed = 0;
    let totalTicketsAwarded = 0;
    const processedUsers = new Set();

    // 2. For each post, get the reactions and process them
    for (const post of posts) {
      console.log(`\n🔍 Processing post: ${post.hash}`);
      console.log(`📝 Post content: "${post.text.substring(0, 100)}..."`);

      try {
        // Get reactions for this cast - try multiple endpoint formats
        let reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?identifier=${post.hash}&type=hash&limit=100`, {
          headers: {
            'accept': 'application/json',
            'api_key': NEYNAR_API_KEY
          }
        });

        // If that fails, try the old format
        if (!reactionsResponse.ok) {
          reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?hash=${post.hash}&types=likes&limit=100`, {
            headers: {
              'accept': 'application/json',
              'api_key': NEYNAR_API_KEY
            }
          });
        }

        if (!reactionsResponse.ok) {
          console.log(`⚠️ Failed to fetch reactions for ${post.hash}: ${reactionsResponse.status}`);
          continue;
        }

        const reactionsData = await reactionsResponse.json();
        console.log(`📊 Raw reaction data:`, JSON.stringify(reactionsData, null, 2));
        
        // Handle different response formats
        let likes = [];
        if (reactionsData.reactions?.likes) {
          likes = reactionsData.reactions.likes;
        } else if (reactionsData.likes) {
          likes = reactionsData.likes;
        } else if (Array.isArray(reactionsData.reactions)) {
          likes = reactionsData.reactions.filter((r: any) => r.type === 'like');
        }

        console.log(`❤️ Found ${likes.length} likes on this post`);

        // Process each like
        for (const like of likes) {
          const userFid = like.user.fid;
          const username = like.user.username;

          try {
            console.log(`  👤 Processing like from ${username} (FID: ${userFid})`);

            // Use EngagementService to award ticket
            const result = await EngagementService.processLikeEvent({
              type: 'like',
              userFid: userFid.toString(),
              castHash: post.hash,
              timestamp: new Date(like.timestamp),
              authorFid: '1206612'
            });

            if (result.success) {
              totalTicketsAwarded += result.ticketsAwarded || 0;
              processedUsers.add(userFid);
              console.log(`    ✅ Awarded ${result.ticketsAwarded || 0} tickets to ${username}`);
            } else {
              console.log(`    ⚠️ No ticket awarded: ${result.message}`);
            }

            totalLikesProcessed++;

          } catch (error) {
            console.log(`    ❌ Error processing like from ${username}:`, error);
          }
        }

        // Add small delay between posts to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(`❌ Error processing post ${post.hash}:`, error);
      }
    }

    console.log('\n📊 Scan completed!');
    console.log(`✅ Processed ${totalLikesProcessed} likes`);
    console.log(`🎫 Awarded ${totalTicketsAwarded} total tickets`);
    console.log(`👥 ${processedUsers.size} unique users received tickets`);

    return NextResponse.json({
      success: true,
      message: 'Retroactive like scan completed',
      data: {
        postsScanned: posts.length,
        likesProcessed: totalLikesProcessed,
        ticketsAwarded: totalTicketsAwarded,
        uniqueUsers: processedUsers.size,
        userFids: Array.from(processedUsers)
      }
    });

  } catch (error) {
    console.error('❌ Error scanning likes:', error);
    return NextResponse.json({
      error: 'Failed to scan likes',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * GET endpoint to check if scan is possible
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Like2Win Retroactive Like Scanner',
    description: 'Scans existing likes on @Like2Win posts and awards tickets retroactively',
    ready: !!NEYNAR_API_KEY,
    neynarApiKey: NEYNAR_API_KEY ? 'configured' : 'missing',
    message: NEYNAR_API_KEY ? 
      'Ready to scan likes. POST to this endpoint to start.' : 
      'Configure NEYNAR_API_KEY to enable like scanning.'
  });
}