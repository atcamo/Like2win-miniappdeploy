import { NextRequest, NextResponse } from 'next/server';

/**
 * Investigate why specific users (itsai, zahoorahmed) are missing from leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Investigating missing users...');

    const targetUsers = [
      { username: 'itsai', fid: 418671 },
      { username: 'zahoorahmed', fid: 245969 }
    ];

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({
        error: 'NEYNAR_API_KEY not configured'
      }, { status: 400 });
    }

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    const investigation: any = {};

    try {
      // 1. Get active raffle info
      const raffleResult = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate", status, 
               "totalTickets", "totalParticipants"
        FROM raffles 
        WHERE status = 'ACTIVE'
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      const activeRaffle = raffleResult.rows[0];
      investigation.activeRaffle = activeRaffle;

      console.log(`📊 Active raffle: ${activeRaffle?.weekPeriod || 'None'}`);
      if (activeRaffle) {
        console.log(`   Period: ${activeRaffle.startDate} to ${activeRaffle.endDate}`);
      }

      // 2. Check if users exist in our database
      for (const user of targetUsers) {
        console.log(`\n🔍 Investigating ${user.username} (FID: ${user.fid})...`);

        const userInvestigation: any = {
          fid: user.fid,
          username: user.username
        };

        // Check in users table
        const userResult = await pool.query(`
          SELECT fid, username, "displayName", "isFollowingLike2Win", "totalLifetimeTickets"
          FROM users
          WHERE fid = $1
        `, [user.fid.toString()]);

        userInvestigation.inUsersTable = userResult.rows.length > 0;
        if (userResult.rows.length > 0) {
          userInvestigation.userRecord = userResult.rows[0];
        }

        // Check in user_tickets table
        const ticketsResult = await pool.query(`
          SELECT ut."raffleId", ut."userFid", ut."ticketsCount", 
                 ut."firstLikeAt", ut."lastLikeAt", ut."createdAt",
                 r."weekPeriod"
          FROM user_tickets ut
          LEFT JOIN raffles r ON ut."raffleId" = r.id
          WHERE ut."userFid" = $1
          ORDER BY ut."createdAt" DESC
        `, [user.fid]);

        userInvestigation.ticketRecords = ticketsResult.rows;
        userInvestigation.hasTickets = ticketsResult.rows.length > 0;

        // Check in engagement_log table
        const engagementResult = await pool.query(`
          SELECT "userFid", "castHash", "hasLiked", "ticketAwarded", 
                 "createdAt", "updatedAt"
          FROM engagement_log
          WHERE "userFid" = $1
          ORDER BY "createdAt" DESC
          LIMIT 10
        `, [user.fid.toString()]);

        userInvestigation.engagementRecords = engagementResult.rows;
        userInvestigation.hasEngagement = engagementResult.rows.length > 0;

        investigation[user.username] = userInvestigation;
      }

      // 3. Check recent Like2Win posts and their likes from these users
      console.log('\n📱 Checking recent Like2Win posts for likes from target users...');

      const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=1206612&limit=5`, {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY
        }
      });

      if (!castsResponse.ok) {
        throw new Error(`Failed to fetch posts: ${castsResponse.status}`);
      }

      const castsData = await castsResponse.json();
      const posts = castsData.casts || [];

      investigation.postsAnalysis = [];

      for (const post of posts) {
        console.log(`🔍 Post: ${post.hash.substring(0, 10)}...`);

        const postAnalysis: any = {
          hash: post.hash,
          text: post.text.substring(0, 100),
          timestamp: post.timestamp,
          feedLikes: post.reactions?.likes_count || 0
        };

        // Get reactions using correct endpoint
        const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/reactions/cast?hash=${post.hash}&types=likes&limit=100`, {
          headers: {
            'accept': 'application/json',
            'api_key': NEYNAR_API_KEY
          }
        });

        if (reactionsResponse.ok) {
          const reactionsData = await reactionsResponse.json();
          const likes = reactionsData.reactions || [];

          postAnalysis.apiLikes = likes.length;
          postAnalysis.likesFromTargetUsers = [];

          // Check if our target users liked this post
          for (const user of targetUsers) {
            const userLike = likes.find((like: any) => like.user.fid === user.fid);
            if (userLike) {
              postAnalysis.likesFromTargetUsers.push({
                username: user.username,
                fid: user.fid,
                timestamp: userLike.reaction_timestamp,
                withinRafflePeriod: activeRaffle ? 
                  new Date(userLike.reaction_timestamp) >= new Date(activeRaffle.startDate) && 
                  new Date(userLike.reaction_timestamp) <= new Date(activeRaffle.endDate) : false
              });

              console.log(`  ✅ ${user.username} liked this post at ${userLike.reaction_timestamp}`);
            }
          }
        } else {
          postAnalysis.apiError = await reactionsResponse.text();
        }

        investigation.postsAnalysis.push(postAnalysis);
      }

      // 4. Summary analysis
      investigation.summary = {
        activeRaffleExists: !!activeRaffle,
        usersWithLikesFound: investigation.postsAnalysis.reduce((count: number, post: any) => 
          count + post.likesFromTargetUsers?.length || 0, 0),
        possibleReasons: []
      };

      // Analyze possible reasons
      for (const user of targetUsers) {
        const userInv = investigation[user.username];
        const reasons = [];

        if (!userInv.inUsersTable) {
          reasons.push('User not in users table');
        }
        if (!userInv.hasTickets) {
          reasons.push('No ticket records found');
        }
        if (!userInv.hasEngagement) {
          reasons.push('No engagement logs found');
        }

        const likesFromUser = investigation.postsAnalysis.reduce((count: number, post: any) =>
          count + (post.likesFromTargetUsers?.filter((like: any) => like.fid === user.fid).length || 0), 0);

        if (likesFromUser === 0) {
          reasons.push('No likes found on recent posts');
        } else {
          reasons.push(`Found ${likesFromUser} likes on recent posts`);
        }

        investigation.summary.possibleReasons.push({
          user: user.username,
          reasons
        });
      }

      return NextResponse.json({
        success: true,
        investigation
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error investigating missing users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to investigate missing users',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}