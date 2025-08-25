import { NextRequest, NextResponse } from 'next/server';

/**
 * Clean the specific fake user FID 12345 from the database - FIXED VERSION
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Cleaning fake user FID 12345 (fixed version)...');

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // First, let's check what columns exist
      const schemaCheck = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'user_tickets'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 user_tickets schema:', schemaCheck.rows);

      await pool.query('BEGIN');

      // 1. Delete from user_tickets - use the correct column name
      const deleteTicketsResult = await pool.query(`
        DELETE FROM user_tickets 
        WHERE "userFid" = $1
      `, [12345]);
      console.log(`🗑️ Deleted ${deleteTicketsResult.rowCount} ticket records`);

      // 2. Delete from users table - FID is stored as string
      const deleteUsersResult = await pool.query(`
        DELETE FROM users 
        WHERE fid = $1
      `, ['12345']);
      console.log(`🗑️ Deleted ${deleteUsersResult.rowCount} user records`);

      // 3. Check engagement_log schema too
      const engagementSchemaCheck = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'engagement_log'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 engagement_log schema:', engagementSchemaCheck.rows);

      // Delete from engagement_log with correct column name
      const deleteEngagementResult = await pool.query(`
        DELETE FROM engagement_log 
        WHERE "userFid" = $1
      `, ['12345']);
      console.log(`🗑️ Deleted ${deleteEngagementResult.rowCount} engagement records`);

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
        WHERE status = 'ACTIVE'
      `);
      console.log(`📊 Updated ${updateRaffleResult.rowCount} raffle records`);

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
        rafflesUpdated: updateRaffleResult.rowCount || 0,
        schemas: {
          userTickets: schemaCheck.rows,
          engagementLog: engagementSchemaCheck.rows
        }
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