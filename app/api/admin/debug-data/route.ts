import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug API to see what's actually in the database
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging database contents...');

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // 1. Check raffles
      const rafflesResult = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate", status, 
               "totalTickets", "totalParticipants", "createdAt"
        FROM raffles 
        ORDER BY "createdAt" DESC 
        LIMIT 5
      `);

      // 2. Check user_tickets
      const ticketsResult = await pool.query(`
        SELECT ut."raffleId", ut."userFid", ut."ticketsCount", 
               ut."firstLikeAt", ut."lastLikeAt",
               r."weekPeriod"
        FROM user_tickets ut
        LEFT JOIN raffles r ON ut."raffleId" = r.id
        ORDER BY ut."ticketsCount" DESC, ut."userFid" ASC
        LIMIT 20
      `);

      // 3. Get specific user (itsai FID 418671)
      const itsaiResult = await pool.query(`
        SELECT ut."raffleId", ut."userFid", ut."ticketsCount", 
               ut."firstLikeAt", ut."lastLikeAt",
               r."weekPeriod", r.status
        FROM user_tickets ut
        LEFT JOIN raffles r ON ut."raffleId" = r.id
        WHERE ut."userFid" = 418671
      `);

      // 4. Check engagement logs
      const engagementResult = await pool.query(`
        SELECT COUNT(*) as total_engagements,
               COUNT(DISTINCT "userFid") as unique_users,
               COUNT(CASE WHEN "hasLiked" = true THEN 1 END) as likes,
               COUNT(CASE WHEN "ticketAwarded" = true THEN 1 END) as tickets_awarded
        FROM engagement_log
      `);

      // 5. Users table check
      const usersResult = await pool.query(`
        SELECT COUNT(*) as total_users,
               COUNT(CASE WHEN "isFollowingLike2Win" = true THEN 1 END) as following_like2win,
               COUNT(CASE WHEN "totalLifetimeTickets" > 0 THEN 1 END) as users_with_tickets
        FROM users
      `);

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          raffles: {
            total: rafflesResult.rows.length,
            list: rafflesResult.rows.map((r: any) => ({
              id: r.id,
              weekPeriod: r.weekPeriod,
              status: r.status,
              totalTickets: r.totalTickets,
              totalParticipants: r.totalParticipants,
              createdAt: r.createdAt
            }))
          },
          tickets: {
            total: ticketsResult.rows.length,
            list: ticketsResult.rows.map((t: any) => ({
              raffleId: t.raffleId,
              userFid: t.userFid.toString(),
              ticketsCount: t.ticketsCount,
              weekPeriod: t.weekPeriod,
              firstLikeAt: t.firstLikeAt,
              lastLikeAt: t.lastLikeAt
            }))
          },
          itsaiUser: {
            found: itsaiResult.rows.length > 0,
            data: itsaiResult.rows.map((t: any) => ({
              raffleId: t.raffleId,
              userFid: t.userFid.toString(),
              ticketsCount: t.ticketsCount,
              weekPeriod: t.weekPeriod,
              status: t.status
            }))
          },
          engagementLogs: engagementResult.rows[0] || {},
          users: usersResult.rows[0] || {},
          analysis: {
            hasActiveRaffle: rafflesResult.rows.some(r => r.status === 'ACTIVE'),
            topUserFid: ticketsResult.rows[0]?.userFid?.toString() || 'none',
            maxTickets: ticketsResult.rows[0]?.ticketsCount || 0,
            dataLooksReal: ticketsResult.rows.length > 4 && 
                         ticketsResult.rows.some(r => r.ticketsCount !== 25 && r.ticketsCount !== 18)
          }
        }
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Debug data error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to debug data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}