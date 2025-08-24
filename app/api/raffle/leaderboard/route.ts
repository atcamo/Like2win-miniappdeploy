import { NextRequest, NextResponse } from 'next/server';

/**
 * Real Leaderboard API
 * Uses the same database queries as admin/stats but formatted for leaderboard display
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'current';

    console.log('🏆 Loading leaderboard for period:', period);

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // 1. Get current raffle
      const raffleResult = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate", status, "totalTickets", "totalParticipants"
        FROM raffles 
        WHERE status = 'ACTIVE' 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (raffleResult.rows.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            raffle: null,
            leaderboard: [],
            meta: {
              totalEntries: 0,
              maxRank: 0
            }
          }
        });
      }

      const raffle = raffleResult.rows[0];

      // 2. Get leaderboard data
      const leaderboardResult = await pool.query(`
        SELECT "userFid", "ticketsCount"
        FROM user_tickets 
        WHERE "raffleId" = $1
        AND "ticketsCount" > 0
        ORDER BY "ticketsCount" DESC, "userFid" ASC
        LIMIT 100
      `, [raffle.id]);

      // 3. Format leaderboard
      const leaderboard = leaderboardResult.rows.map((row: any, index: number) => ({
        rank: index + 1,
        fid: row.userFid.toString(),
        username: `fid${row.userFid}`, // TODO: Resolve usernames
        displayName: `User ${row.userFid}`, // TODO: Resolve display names
        tickets: row.ticketsCount || 0,
        probability: leaderboardResult.rows.length > 0 ? 
          ((row.ticketsCount || 0) / (raffle.totalTickets || 1)) * 100 : 0,
        totalLifetimeTickets: row.ticketsCount || 0,
        totalWinnings: 0
      }));

      const response = {
        success: true,
        data: {
          raffle: {
            id: raffle.id,
            weekPeriod: raffle.weekPeriod,
            status: raffle.status,
            totalParticipants: raffle.totalParticipants || 0,
            totalTickets: raffle.totalTickets || 0,
            prizePool: 50000, // Default prize pool in DEGEN
            isSelfSustaining: false
          },
          leaderboard,
          meta: {
            totalEntries: leaderboard.length,
            maxRank: leaderboard.length
          }
        }
      };

      return NextResponse.json(response);

    } finally {
      try {
        await pool.end();
      } catch (e) {
        // Ignore pool end errors
      }
    }

  } catch (error) {
    console.error('❌ Leaderboard API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load leaderboard',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}