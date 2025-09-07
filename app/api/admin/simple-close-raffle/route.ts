import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple endpoint to close active raffle without winner selection
 * Useful for transitioning to daily raffle system
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔒 Simple raffle closure (no winner selection)...');

    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // Get current active raffle
      const activeRaffleResult = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate", "totalTickets", "totalParticipants"
        FROM raffles 
        WHERE status = 'ACTIVE'
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (activeRaffleResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No active raffle found'
        });
      }

      const raffle = activeRaffleResult.rows[0];
      console.log(`🎯 Closing raffle: ${raffle.weekPeriod}`);

      // Close the raffle without winner selection
      await pool.query(`
        UPDATE raffles 
        SET status = 'COMPLETED',
            "executedAt" = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [raffle.id]);

      console.log('✅ Raffle closed successfully');

      // Now create today's daily raffle
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1, 0, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const weekPeriod = `Daily ${startDate.toISOString().split('T')[0]}`;

      console.log('🚀 Creating daily raffle:', weekPeriod);

      const newRaffle = await pool.query(`
        INSERT INTO raffles (
          id, "weekPeriod", "startDate", "endDate", 
          "totalPool", status, "createdAt",
          "totalTickets", "totalParticipants"
        ) VALUES (
          gen_random_uuid(), 
          $1, $2, $3, 500, 'ACTIVE', NOW(), 0, 0
        ) RETURNING id, "weekPeriod", "startDate", "endDate"
      `, [weekPeriod, startDate, endDate]);

      console.log('✅ Created daily raffle:', newRaffle.rows[0]);

      return NextResponse.json({
        success: true,
        message: 'Successfully transitioned to daily raffle system',
        closedRaffle: {
          id: raffle.id,
          weekPeriod: raffle.weekPeriod,
          totalParticipants: raffle.totalParticipants,
          totalTickets: raffle.totalTickets
        },
        newRaffle: newRaffle.rows[0],
        timestamp: new Date().toISOString()
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error in simple raffle closure:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to close raffle and create daily raffle',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Simple Raffle Closure',
    description: 'Close active raffle without winner selection and create daily raffle',
    usage: 'POST to close current raffle and start daily system',
    timestamp: new Date().toISOString()
  });
}