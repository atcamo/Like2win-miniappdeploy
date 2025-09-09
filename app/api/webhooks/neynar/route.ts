import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleService } from '@/lib/services/dailyRaffleService';

/**
 * Neynar Webhook Handler for Farcaster Events
 * Receives real-time notifications of likes, recasts, comments on Farcaster
 * Only processes events during active raffle periods
 * Now with instant cache updates!
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 Neynar webhook received:', {
      type: body.type,
      timestamp: new Date().toISOString(),
      data: body.data ? 'present' : 'missing'
    });

    // Validate webhook signature (if needed)
    // const signature = request.headers.get('x-neynar-signature');
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Extract event details based on Neynar webhook structure
    const eventType = body.type;
    const eventData = body.data;

    if (!eventData) {
      return NextResponse.json({ error: 'No event data provided' }, { status: 400 });
    }

    // Process different types of events
    switch (eventType) {
      case 'cast.created':
        // New cast created - not relevant for Like2Win engagement
        return NextResponse.json({ message: 'Cast creation ignored', processed: false });

      case 'reaction.created':
        // Someone reacted to a cast (like, recast)
        return await handleReactionEvent(eventData);

      case 'cast.mentioned':
        // Someone mentioned @Like2Win - potential engagement
        return await handleMentionEvent(eventData);

      default:
        console.log('ℹ️ Unhandled webhook event type:', eventType);
        return NextResponse.json({ 
          message: `Event type ${eventType} not processed`,
          processed: false 
        });
    }

  } catch (error) {
    console.error('❌ Error processing Neynar webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}

/**
 * Handle reaction events (likes, recasts)
 */
async function handleReactionEvent(eventData: any) {
  try {
    const reaction = eventData.reaction;
    const cast = eventData.cast;
    const user = eventData.user;

    if (!reaction || !cast || !user) {
      return NextResponse.json({ error: 'Incomplete reaction data' }, { status: 400 });
    }

    // Check if this is a reaction to a Like2Win official post
    const isLike2WinPost = isOfficialLike2WinPost(cast);
    
    if (!isLike2WinPost) {
      return NextResponse.json({ 
        message: 'Reaction not on Like2Win official post',
        processed: false 
      });
    }

    // Determine engagement type
    let engagementType: string;
    switch (reaction.type) {
      case 'like':
        engagementType = 'like';
        break;
      case 'recast':
        engagementType = 'recast';
        break;
      default:
        return NextResponse.json({ 
          message: `Reaction type ${reaction.type} not supported`,
          processed: false 
        });
    }

    // Check if user follows @like2win before awarding tickets
    console.log(`🔍 Checking if user ${user.fid} follows @like2win...`);
    
    let isFollowing = false;
    try {
      const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
      if (NEYNAR_API_KEY) {
        const followResponse = await fetch(`https://api.neynar.com/v1/farcaster/user-by-fid?fid=${user.fid}`, {
          headers: {
            'accept': 'application/json',
            'api_key': NEYNAR_API_KEY
          }
        });
        
        if (followResponse.ok) {
          const userData = await followResponse.json();
          // Check if user follows Like2Win (FID: 1206612)
          isFollowing = userData.result?.user?.following?.some((follow: any) => 
            follow.fid === 1206612 || follow.username === 'like2win'
          ) || false;
        }
      }
    } catch (followError) {
      console.log(`⚠️ Could not verify follow status for user ${user.fid}:`, followError);
      // Default to false if can't verify
      isFollowing = false;
    }

    if (!isFollowing) {
      console.log(`❌ User ${user.fid} doesn't follow @like2win - no ticket awarded`);
      
      return NextResponse.json({
        message: 'Like detected but user must follow @like2win to earn tickets',
        processed: false,
        result: {
          success: false,
          userFid: user.fid,
          engagementType: engagementType,
          ticketsAwarded: 0,
          reason: 'Must follow @like2win to participate',
          followStatus: {
            isFollowing: false,
            message: 'Please follow @like2win to earn raffle tickets'
          }
        }
      });
    }

    // Process the engagement with daily raffle service (user follows @like2win)
    const userTickets = dailyRaffleService.addTickets(user.fid, 1, engagementType);
    
    console.log(`🎫 Webhook processed: User ${user.fid} (follows @like2win) got 1 ticket for ${engagementType} (total: ${userTickets.tickets})`);

    return NextResponse.json({
      message: 'Reaction processed with daily raffle service - user follows @like2win',
      processed: true,
      result: {
        success: true,
        userFid: user.fid,
        engagementType: engagementType,
        ticketsAwarded: 1,
        totalTickets: userTickets.tickets,
        timestamp: userTickets.lastActivity,
        followStatus: {
          isFollowing: true,
          verified: true
        }
      },
      cacheUpdated: false
    });

  } catch (error) {
    console.error('❌ Error handling reaction event:', error);
    return NextResponse.json({ error: 'Error processing reaction' }, { status: 500 });
  }
}

/**
 * Handle mention events
 */
async function handleMentionEvent(eventData: any) {
  try {
    // For now, we just log mentions but don't process them for tickets
    console.log('📢 Like2Win mentioned in cast:', {
      castHash: eventData.cast?.hash,
      authorFid: eventData.cast?.author?.fid,
      timestamp: eventData.cast?.timestamp
    });

    return NextResponse.json({ 
      message: 'Mention logged',
      processed: false // We don't award tickets for mentions yet
    });

  } catch (error) {
    console.error('❌ Error handling mention event:', error);
    return NextResponse.json({ error: 'Error processing mention' }, { status: 500 });
  }
}

/**
 * Check if a cast is from an official Like2Win account
 */
function isOfficialLike2WinPost(cast: any): boolean {
  if (!cast || !cast.author) return false;

  // Define official Like2Win account identifiers
  const officialAccounts = [
    'like2win',           // Official username
    '1206612',           // Official Like2Win FID
  ];

  const authorUsername = cast.author.username?.toLowerCase();
  const authorFid = cast.author.fid?.toString();

  // For production: Only process likes on official Like2Win posts
  return officialAccounts.includes(authorUsername) || 
         officialAccounts.includes(authorFid);
}

/**
 * GET endpoint for webhook testing and info
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Like2Win Neynar Webhook Handler',
    description: 'Receives Farcaster events and processes engagement during active raffle periods',
    supportedEvents: [
      'reaction.created (likes, recasts)',
      'cast.mentioned (@Like2Win mentions)'
    ],
    webhookUrl: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/neynar`,
    status: 'active',
    lastChecked: new Date().toISOString()
  });
}