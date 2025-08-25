import { NextRequest, NextResponse } from 'next/server';

/**
 * Clean the specific fake user FID 12345 from the database
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Cleaning fake user FID 12345...');

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      await pool.query('BEGIN');

      // 1. Delete from user_tickets
      const deleteTicketsResult = await pool.query(`
        DELETE FROM user_tickets 
        WHERE "userFid" = 12345
      `);

      // 2. Delete from users table
      const deleteUsersResult = await pool.query(`
        DELETE FROM users 
        WHERE fid = '12345'
      `);

      // 3. Delete from engagement_log
      const deleteEngagementResult = await pool.query(`
        DELETE FROM engagement_log 
        WHERE "userFid" = '12345'
      `);

      // 4. Update raffle totals
      const updateRaffleResult = await pool.query(`
        UPDATE raffles SET 
          "totalTickets" = (
            SELECT COALESCE(SUM("ticketsCount"), 0) 
            FROM user_tickets 
            WHERE "raffleId" = raffles.id
          ), 
          "totalParticipants" = (
            SELECT COUNT(DISTINCT "userFid") 
            FROM user_tickets 
            WHERE "raffleId" = raffles.id
          )
      `);

      await pool.query('COMMIT');

      console.log('✅ Successfully cleaned fake user FID 12345');

      return NextResponse.json({
        success: true,
        message: 'Successfully cleaned fake user FID 12345',
        deleted: {
          userTickets: deleteTicketsResult.rowCount || 0,
          users: deleteUsersResult.rowCount || 0,
          engagementLogs: deleteEngagementResult.rowCount || 0
        },
        rafflesUpdated: updateRaffleResult.rowCount || 0
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error cleaning fake user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clean fake user',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}