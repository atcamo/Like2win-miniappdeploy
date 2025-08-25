import { NextRequest, NextResponse } from 'next/server';

/**
 * Clean fake/mocked data from the database
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting fake data cleanup...');

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // 1. First, let's see what fake data exists
      console.log('🔍 Checking for fake data...');
      
      const fakeTicketsResult = await pool.query(`
        SELECT ut."raffleId", ut."userFid", ut."ticketsCount", ut."createdAt",
               r."weekPeriod"
        FROM user_tickets ut
        LEFT JOIN raffles r ON ut."raffleId" = r.id
        WHERE ut."userFid" IN (12345, 67890, 11111, 22222, 99999)
        ORDER BY ut."userFid"
      `);

      const fakeDataFound = fakeTicketsResult.rows;
      
      if (fakeDataFound.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No fake data found to clean',
          cleaned: {
            userTickets: 0,
            users: 0,
            engagementLogs: 0
          }
        });
      }

      console.log(`🚨 Found ${fakeDataFound.length} fake ticket entries`);
      fakeDataFound.forEach((fake: any, i: number) => {
        console.log(`  ${i+1}. FID ${fake.userFid}: ${fake.ticketsCount} tickets (${fake.weekPeriod})`);
      });

      // 2. Delete fake data in transaction
      await pool.query('BEGIN');

      // Delete user_tickets for fake FIDs
      const deleteTicketsResult = await pool.query(`
        DELETE FROM user_tickets 
        WHERE "userFid" IN (12345, 67890, 11111, 22222, 99999)
      `);

      // Delete users for fake FIDs
      const deleteUsersResult = await pool.query(`
        DELETE FROM users 
        WHERE fid IN ('12345', '67890', '11111', '22222', '99999')
      `);

      // Delete engagement logs for fake FIDs
      const deleteEngagementResult = await pool.query(`
        DELETE FROM engagement_log 
        WHERE "userFid" IN ('12345', '67890', '11111', '22222', '99999')
      `);

      // 3. Update raffle totals after cleanup
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

      console.log('✅ Fake data cleanup completed successfully');

      return NextResponse.json({
        success: true,
        message: 'Successfully cleaned fake data from database',
        cleaned: {
          userTickets: deleteTicketsResult.rowCount || 0,
          users: deleteUsersResult.rowCount || 0,
          engagementLogs: deleteEngagementResult.rowCount || 0,
          rafflesUpdated: updateRaffleResult.rowCount || 0
        },
        removedData: fakeDataFound.map((fake: any) => ({
          fid: fake.userFid,
          tickets: fake.ticketsCount,
          weekPeriod: fake.weekPeriod
        }))
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error cleaning fake data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clean fake data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to preview what fake data would be cleaned
 */
export async function GET(request: NextRequest) {
  try {
    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // Check what fake data exists
      const fakeTicketsResult = await pool.query(`
        SELECT ut."raffleId", ut."userFid", ut."ticketsCount", ut."createdAt",
               r."weekPeriod"
        FROM user_tickets ut
        LEFT JOIN raffles r ON ut."raffleId" = r.id
        WHERE ut."userFid" IN (12345, 67890, 11111, 22222, 99999)
        ORDER BY ut."userFid"
      `);

      const fakeUsersResult = await pool.query(`
        SELECT fid, username, "displayName", "totalLifetimeTickets"
        FROM users
        WHERE fid IN ('12345', '67890', '11111', '22222', '99999')
      `);

      const fakeEngagementResult = await pool.query(`
        SELECT "userFid", COUNT(*) as engagement_count
        FROM engagement_log
        WHERE "userFid" IN ('12345', '67890', '11111', '22222', '99999')
        GROUP BY "userFid"
      `);

      return NextResponse.json({
        success: true,
        preview: {
          fakeTickets: fakeTicketsResult.rows,
          fakeUsers: fakeUsersResult.rows,
          fakeEngagements: fakeEngagementResult.rows
        },
        summary: {
          ticketsToDelete: fakeTicketsResult.rows.length,
          usersToDelete: fakeUsersResult.rows.length,
          engagementsToDelete: fakeEngagementResult.rows.reduce((sum: number, row: any) => sum + parseInt(row.engagement_count), 0)
        }
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error previewing fake data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to preview fake data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}