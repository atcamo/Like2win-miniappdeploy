import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userFid = searchParams.get('userFid') || '12345';
    const testTimestamp = searchParams.get('timestamp') || '2025-01-20T12:00:00Z';

    console.log('🔍 Debug engagement processing for:', { userFid, testTimestamp });

    // Check database connection
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not configured' });
    }

    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    // 1. Check active raffle for timestamp
    const raffleResult = await pool.query(`
      SELECT id, "weekPeriod", "startDate", "endDate", status, "totalTickets", "totalParticipants"
      FROM raffles 
      WHERE status = 'ACTIVE' 
      AND "startDate" <= $1 
      AND "endDate" >= $1
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `, [new Date(testTimestamp)]);

    // 2. Check all raffles for comparison
    const allRafflesResult = await pool.query(`
      SELECT id, "weekPeriod", "startDate", "endDate", status
      FROM raffles 
      ORDER BY "createdAt" DESC
    `);

    // 3. Check user's current tickets
    let userTickets = 0;
    if (raffleResult.rows.length > 0) {
      const currentRaffle = raffleResult.rows[0];
      const ticketsResult = await pool.query(`
        SELECT "ticketsCount" FROM user_tickets 
        WHERE "raffleId" = $1 AND "userFid" = $2
      `, [currentRaffle.id, userFid]);
      
      if (ticketsResult.rows.length > 0) {
        userTickets = parseInt(ticketsResult.rows[0].ticketsCount);
      }
    }

    // 4. Check engagement log for this user
    const engagementResult = await pool.query(`
      SELECT "raffleId", "castHash", type, "createdAt"
      FROM engagement_log 
      WHERE "userFid" = $1
      ORDER BY "createdAt" DESC
      LIMIT 5
    `, [userFid]);

    await pool.end();

    return NextResponse.json({
      debug: {
        userFid,
        testTimestamp,
        databaseConnected: true
      },
      activeRaffleForTimestamp: raffleResult.rows[0] || null,
      isTimestampValid: raffleResult.rows.length > 0,
      allRaffles: allRafflesResult.rows,
      userCurrentTickets: userTickets,
      userEngagementHistory: engagementResult.rows,
      analysis: {
        timestampCheck: {
          provided: testTimestamp,
          raffleStart: raffleResult.rows[0]?.startDate,
          raffleEnd: raffleResult.rows[0]?.endDate,
          isWithinPeriod: raffleResult.rows.length > 0
        },
        recommendation: raffleResult.rows.length > 0 
          ? 'Timestamp is valid, should process engagement'
          : 'Timestamp is outside active raffle period. Update raffle dates or use timestamp within 2025-01-13 to 2025-01-26'
      }
    });

  } catch (error) {
    console.error('❌ Debug engagement error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}