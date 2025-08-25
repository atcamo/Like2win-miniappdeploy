import { NextRequest, NextResponse } from 'next/server';

/**
 * Investigate duplicate tickets and likes processing
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Investigating duplicate tickets...');

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    const investigation: any = {};

    try {
      // 1. Check atcamo's (FID 432789) engagement logs
      console.log('🔍 Checking atcamo engagement logs...');
      const atcamoEngagement = await pool.query(`
        SELECT el."userFid", el."castHash", el."hasLiked", el."ticketAwarded", 
               el."createdAt", el."updatedAt"
        FROM engagement_log el
        WHERE el."userFid" = '432789'
        ORDER BY el."createdAt" DESC
        LIMIT 50
      `);

      investigation.atcamoEngagement = {
        totalRecords: atcamoEngagement.rows.length,
        records: atcamoEngagement.rows
      };

      // 2. Check for duplicate cast hashes for atcamo
      const duplicateCasts = await pool.query(`
        SELECT "castHash", COUNT(*) as count
        FROM engagement_log
        WHERE "userFid" = '432789'
        GROUP BY "castHash"
        HAVING COUNT(*) > 1
        ORDER BY count DESC
      `);

      investigation.atcamoDuplicates = duplicateCasts.rows;

      // 3. Get atcamo's current ticket records
      const atcamoTickets = await pool.query(`
        SELECT ut."raffleId", ut."userFid", ut."ticketsCount", 
               ut."firstLikeAt", ut."lastLikeAt", ut."createdAt",
               r."weekPeriod"
        FROM user_tickets ut
        LEFT JOIN raffles r ON ut."raffleId" = r.id
        WHERE ut."userFid" = 432789
        ORDER BY ut."createdAt" DESC
      `);

      investigation.atcamoTickets = atcamoTickets.rows;

      // 4. Check all users for potential over-allocation
      const allUserTickets = await pool.query(`
        SELECT ut."userFid", ut."ticketsCount", 
               COUNT(el."userFid") as engagement_count
        FROM user_tickets ut
        LEFT JOIN engagement_log el ON ut."userFid" = el."userFid"
        WHERE ut."ticketsCount" > 9
        GROUP BY ut."userFid", ut."ticketsCount"
        ORDER BY ut."ticketsCount" DESC
      `);

      investigation.suspiciousUsers = allUserTickets.rows;

      // 5. Get recent Like2Win posts and check actual likes from atcamo
      if (NEYNAR_API_KEY) {
        console.log('📱 Checking actual likes from atcamo on Like2Win posts...');
        
        const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=1206612&limit=10`, {
          headers: {
            'accept': 'application/json',
            'api_key': NEYNAR_API_KEY
          }
        });

        if (castsResponse.ok) {
          const castsData = await castsResponse.json();
          const posts = castsData.casts || [];
          
          investigation.actualLikesFromAtcamo = [];
          let totalActualLikes = 0;

          for (const post of posts) {
            const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/reactions/cast?hash=${post.hash}&types=likes&limit=100`, {
              headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
              }
            });

            if (reactionsResponse.ok) {
              const reactionsData = await reactionsResponse.json();
              const likes = reactionsData.reactions || [];
              
              const atcamoLike = likes.find((like: any) => like.user.fid === 432789);
              if (atcamoLike) {
                totalActualLikes++;
                investigation.actualLikesFromAtcamo.push({
                  postHash: post.hash,
                  postText: post.text.substring(0, 50),
                  likeTimestamp: atcamoLike.reaction_timestamp
                });
              }
            }

            await new Promise(resolve => setTimeout(resolve, 300)); // Rate limit
          }

          investigation.summary = {
            atcamoActualLikes: totalActualLikes,
            atcamoTicketsInDB: atcamoTickets.rows[0]?.ticketsCount || 0,
            atcamoEngagementRecords: atcamoEngagement.rows.length,
            possibleDuplicates: duplicateCasts.rows.length,
            shouldHaveMaxTickets: Math.min(totalActualLikes, 9) // Max 9 tickets for any user
          };
        }
      }

      return NextResponse.json({
        success: true,
        investigation,
        recommendations: [
          'Check for duplicate processing of the same cast hash',
          'Verify engagement_log table for multiple entries per cast',
          'Consider implementing unique constraint on (userFid, castHash)',
          'Recalculate tickets based on actual unique likes'
        ]
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error investigating duplicates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to investigate duplicates',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}