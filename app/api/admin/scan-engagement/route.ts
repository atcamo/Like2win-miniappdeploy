import { NextRequest, NextResponse } from 'next/server';

/**
 * Scan and process engagement on Like2Win posts automatically
 * This replaces webhook functionality with programmatic scanning
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting engagement scan...');

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    const LIKE2WIN_FID = 1206612;

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({
        error: 'NEYNAR_API_KEY not configured'
      }, { status: 500 });
    }

    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      await pool.query('BEGIN');

      // 1. Get active raffle
      const activeRaffleResult = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate"
        FROM raffles 
        WHERE status = 'ACTIVE'
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (activeRaffleResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return NextResponse.json({
          error: 'No active raffle found',
          message: 'Create an active raffle first'
        }, { status: 400 });
      }

      const raffle = activeRaffleResult.rows[0];
      console.log(`📊 Processing raffle: ${raffle.weekPeriod}`);

      // 2. Get Like2Win posts from raffle period
      console.log('📱 Fetching Like2Win posts...');
      const castsResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${LIKE2WIN_FID}&limit=20`,
        {
          headers: {
            'accept': 'application/json',
            'api_key': NEYNAR_API_KEY
          }
        }
      );

      if (!castsResponse.ok) {
        throw new Error(`Failed to fetch casts: ${castsResponse.status}`);
      }

      const castsData = await castsResponse.json();
      const posts = castsData.casts || [];

      // Filter posts within raffle period
      const rafflePosts = posts.filter((post: any) => {
        const postDate = new Date(post.timestamp);
        const startDate = new Date(raffle.startDate);
        const endDate = new Date(raffle.endDate);
        return postDate >= startDate && postDate <= endDate;
      });

      console.log(`🎯 Found ${rafflePosts.length} posts in raffle period`);

      let totalNewLikes = 0;
      let totalNewTickets = 0;
      const processedUsers = new Set();

      // 3. Process each post
      for (const post of rafflePosts) {
        console.log(`🔍 Processing post: ${post.hash}`);
        
        // Get detailed cast data with reactions
        const castResponse = await fetch(
          `https://api.neynar.com/v2/farcaster/cast?identifier=${post.hash}&type=hash`,
          {
            headers: {
              'accept': 'application/json',
              'api_key': NEYNAR_API_KEY
            }
          }
        );

        if (!castResponse.ok) {
          console.log(`⚠️ Failed to get cast details for ${post.hash}`);
          continue;
        }

        const castData = await castResponse.json();
        const likes = castData.cast?.reactions?.likes || [];
        console.log(`👍 Found ${likes.length} likes on post`);

        // 4. Process each like
        for (const like of likes) {
          const userFid = like.user.fid;
          
          // Skip Like2Win's own likes
          if (userFid === LIKE2WIN_FID) continue;

          // Check if this engagement is already processed
          const existingEngagement = await pool.query(`
            SELECT id FROM engagement_log
            WHERE "castHash" = $1 AND "userFid" = $2
          `, [post.hash, userFid]);

          if (existingEngagement.rows.length > 0) {
            continue; // Already processed
          }

          // 5. Create engagement log entry
          await pool.query(`
            INSERT INTO engagement_log 
            ("raffleId", "userFid", "castHash", "hasLiked", "ticketAwarded", "createdAt")
            VALUES ($1, $2, $3, true, true, CURRENT_TIMESTAMP)
          `, [raffle.id, userFid, post.hash]);

          totalNewLikes++;

          // 6. Update or create user tickets
          const existingTickets = await pool.query(`
            SELECT id, "ticketsCount" FROM user_tickets
            WHERE "raffleId" = $1 AND "userFid" = $2
          `, [raffle.id, userFid]);

          if (existingTickets.rows.length > 0) {
            // Update existing tickets (max 9 per user)
            const currentTickets = existingTickets.rows[0].ticketsCount;
            if (currentTickets < 9) {
              await pool.query(`
                UPDATE user_tickets 
                SET "ticketsCount" = LEAST("ticketsCount" + 1, 9),
                    "lastLikeAt" = CURRENT_TIMESTAMP
                WHERE "raffleId" = $1 AND "userFid" = $2
              `, [raffle.id, userFid]);
              
              if (!processedUsers.has(userFid)) {
                totalNewTickets++;
                processedUsers.add(userFid);
              }
            }
          } else {
            // Create new user tickets entry
            await pool.query(`
              INSERT INTO user_tickets 
              ("raffleId", "userFid", "ticketsCount", "firstLikeAt", "lastLikeAt")
              VALUES ($1, $2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [raffle.id, userFid]);
            
            totalNewTickets++;
            processedUsers.add(userFid);
          }

          // 7. Ensure user exists in users table
          const userExists = await pool.query(`
            SELECT fid FROM users WHERE fid = $1
          `, [userFid]);

          if (userExists.rows.length === 0) {
            // Create basic user record
            await pool.query(`
              INSERT INTO users (fid, "totalLifetimeTickets", "isFollowingLike2Win", "createdAt")
              VALUES ($1, 1, true, CURRENT_TIMESTAMP)
              ON CONFLICT (fid) DO UPDATE SET
                "totalLifetimeTickets" = users."totalLifetimeTickets" + 1
            `, [userFid]);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 8. Update raffle stats
      const participantsResult = await pool.query(`
        SELECT COUNT(DISTINCT "userFid") as count,
               SUM("ticketsCount") as total_tickets
        FROM user_tickets 
        WHERE "raffleId" = $1
      `, [raffle.id]);

      const stats = participantsResult.rows[0];
      await pool.query(`
        UPDATE raffles 
        SET "totalParticipants" = $1, "totalTickets" = $2
        WHERE id = $3
      `, [parseInt(stats.count), parseInt(stats.total_tickets), raffle.id]);

      await pool.query('COMMIT');
      console.log('✅ Engagement scan completed successfully');

      return NextResponse.json({
        success: true,
        message: 'Engagement scan completed',
        raffle: {
          id: raffle.id,
          weekPeriod: raffle.weekPeriod
        },
        results: {
          postsScanned: rafflePosts.length,
          newLikes: totalNewLikes,
          newTickets: totalNewTickets,
          totalParticipants: parseInt(stats.count),
          totalTickets: parseInt(stats.total_tickets)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error in engagement scan:', error);
    return NextResponse.json(
      { 
        error: 'Engagement scan failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check scan status and last run
 */
export async function GET(request: NextRequest) {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // Get current raffle status
      const raffleResult = await pool.query(`
        SELECT id, "weekPeriod", "totalParticipants", "totalTickets", 
               "startDate", "endDate", status
        FROM raffles 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      // Get latest engagement activity
      const engagementResult = await pool.query(`
        SELECT COUNT(*) as total_engagements,
               MAX("createdAt") as last_engagement
        FROM engagement_log
      `);

      const raffle = raffleResult.rows[0];
      const engagement = engagementResult.rows[0];

      return NextResponse.json({
        success: true,
        currentRaffle: raffle ? {
          id: raffle.id,
          weekPeriod: raffle.weekPeriod,
          status: raffle.status,
          participants: raffle.totalParticipants,
          tickets: raffle.totalTickets,
          period: `${raffle.startDate} to ${raffle.endDate}`
        } : null,
        engagementStats: {
          totalEngagements: parseInt(engagement.total_engagements),
          lastEngagement: engagement.last_engagement
        },
        scanAvailable: !!raffle && raffle.status === 'ACTIVE'
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error getting scan status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get scan status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}