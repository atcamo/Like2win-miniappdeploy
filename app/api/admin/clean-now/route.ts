import { NextRequest, NextResponse } from 'next/server';

/**
 * SIMPLE - Clean fake user FID 12345 NOW
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 SIMPLE cleanup of FID 12345...');

    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // Simple direct cleanup
      await pool.query('BEGIN');
      
      // Delete user_tickets
      const result1 = await pool.query('DELETE FROM user_tickets WHERE "userFid" = 12345');
      
      // Delete users  
      const result2 = await pool.query('DELETE FROM users WHERE fid = $1', ['12345']);
      
      // Delete engagement_log
      const result3 = await pool.query('DELETE FROM engagement_log WHERE "userFid" = $1', ['12345']);
      
      // Update active raffle
      const result4 = await pool.query(`
        UPDATE raffles SET 
          "totalTickets" = (SELECT COALESCE(SUM("ticketsCount"), 0) FROM user_tickets WHERE "raffleId" = raffles.id), 
          "totalParticipants" = (SELECT COUNT(DISTINCT "userFid") FROM user_tickets WHERE "raffleId" = raffles.id)
        WHERE status = 'ACTIVE'
      `);
      
      await pool.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Fake user FID 12345 cleaned successfully',
        deleted: {
          tickets: result1.rowCount,
          users: result2.rowCount, 
          engagement: result3.rowCount,
          rafflesUpdated: result4.rowCount
        }
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json({
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}