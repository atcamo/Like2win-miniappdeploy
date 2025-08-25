import { NextRequest, NextResponse } from 'next/server';

/**
 * Create a new raffle for testing engagement detection
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Creating new raffle...');

    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      await pool.query('BEGIN');

      // Check if there's already an active raffle
      const existingRaffle = await pool.query(`
        SELECT id, "weekPeriod" FROM raffles 
        WHERE status = 'ACTIVE'
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (existingRaffle.rows.length > 0) {
        await pool.query('ROLLBACK');
        return NextResponse.json({
          error: 'Active raffle already exists',
          existingRaffle: existingRaffle.rows[0],
          message: 'Close existing raffle first or use it for testing'
        }, { status: 400 });
      }

      // Create new raffle
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week

      const weekPeriod = `Week ${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;

      const createResult = await pool.query(`
        INSERT INTO raffles (
          "weekPeriod", 
          "startDate", 
          "endDate", 
          "totalParticipants", 
          "totalTickets", 
          "totalPool",
          "tipsReceived",
          "userContribution", 
          "founderContribution", 
          "operationalFee",
          "isSelfSustaining",
          status, 
          "createdAt"
        ) VALUES (
          $1, $2, $3, 0, 0, 1000, 0, 0, 1000, 0, true, 'ACTIVE', CURRENT_TIMESTAMP
        ) RETURNING id, "weekPeriod", "startDate", "endDate"
      `, [weekPeriod, weekStart.toISOString(), weekEnd.toISOString()]);

      const newRaffle = createResult.rows[0];

      await pool.query('COMMIT');
      console.log(`✅ Raffle created: ${newRaffle.weekPeriod}`);

      return NextResponse.json({
        success: true,
        message: 'Raffle created successfully',
        raffle: {
          id: newRaffle.id,
          weekPeriod: newRaffle.weekPeriod,
          startDate: newRaffle.startDate,
          endDate: newRaffle.endDate,
          status: 'ACTIVE'
        },
        nextSteps: [
          'Use /api/admin/scan-engagement to detect likes',
          'Monitor progress with /api/admin/scan-engagement GET',
          'Close raffle with /api/admin/close-raffle when ready'
        ]
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error creating raffle:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create raffle',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET current raffle status
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
      const result = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate", 
               "totalParticipants", "totalTickets", "totalPool",
               status, "createdAt"
        FROM raffles 
        ORDER BY "createdAt" DESC 
        LIMIT 5
      `);

      return NextResponse.json({
        success: true,
        raffles: result.rows,
        activeRaffle: result.rows.find((r: any) => r.status === 'ACTIVE') || null
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error getting raffles:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get raffles',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}