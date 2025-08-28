import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to check active raffles and ensure database connectivity
 */
export async function GET() {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    // Check for active raffles
    const activeRafflesResult = await pool.query(`
      SELECT 
        id, 
        "weekPeriod", 
        "startDate", 
        "endDate", 
        status,
        "totalTickets",
        "totalParticipants",
        ROUND(EXTRACT(EPOCH FROM ("endDate" - NOW())) / 86400, 1) as days_remaining,
        CASE 
          WHEN NOW() < "startDate" THEN 'Not Started Yet'
          WHEN NOW() > "endDate" THEN 'Finished'  
          ELSE 'Active'
        END as calculated_status
      FROM raffles 
      WHERE status = 'ACTIVE'
      ORDER BY "createdAt" DESC
    `);

    // If no active raffle, try to fix by updating dates
    if (activeRafflesResult.rows.length === 0) {
      console.log('❌ No active raffle found, attempting to create/fix...');
      
      // Check if there are any raffles at all
      const allRafflesResult = await pool.query('SELECT COUNT(*) as total FROM raffles');
      const totalRaffles = parseInt(allRafflesResult.rows[0].total);
      
      if (totalRaffles === 0) {
        // Create a new active raffle
        await pool.query(`
          INSERT INTO raffles (
            "weekPeriod", 
            "startDate", 
            "endDate", 
            status, 
            "totalTickets", 
            "totalParticipants"
          ) VALUES (
            'Week 34-37 2025 (Launch Raffle)',
            '2025-08-18T00:00:00.000Z',
            '2025-09-15T23:59:59.000Z',
            'ACTIVE',
            0,
            0
          )
        `);
        console.log('✅ Created new active raffle');
      } else {
        // Update existing raffles to have correct 2025 dates
        await pool.query(`
          UPDATE raffles 
          SET 
            "startDate" = '2025-08-18T00:00:00.000Z',
            "endDate" = '2025-09-15T23:59:59.000Z',
            "weekPeriod" = 'Week 34-37 2025 (Launch Raffle)',
            status = 'ACTIVE'
          WHERE id IN (
            SELECT id FROM raffles ORDER BY "createdAt" DESC LIMIT 1
          )
        `);
        console.log('✅ Updated latest raffle with 2025 dates');
      }

      // Re-query for active raffles
      const updatedResult = await pool.query(`
        SELECT 
          id, 
          "weekPeriod", 
          "startDate", 
          "endDate", 
          status,
          "totalTickets",
          "totalParticipants",
          ROUND(EXTRACT(EPOCH FROM ("endDate" - NOW())) / 86400, 1) as days_remaining,
          CASE 
            WHEN NOW() < "startDate" THEN 'Not Started Yet'
            WHEN NOW() > "endDate" THEN 'Finished'  
            ELSE 'Active'
          END as calculated_status
        FROM raffles 
        WHERE status = 'ACTIVE'
        ORDER BY "createdAt" DESC
      `);
      
      activeRafflesResult.rows = updatedResult.rows;
    }

    await pool.end();

    return NextResponse.json({
      success: true,
      data: {
        activeRaffles: activeRafflesResult.rows,
        message: activeRafflesResult.rows.length > 0 
          ? 'Active raffle found and ready for historical likes loading'
          : 'No active raffle could be created or fixed'
      }
    });

  } catch (error) {
    console.error('❌ Error testing raffle:', error);
    return NextResponse.json(
      { 
        error: 'Database connection or query failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}