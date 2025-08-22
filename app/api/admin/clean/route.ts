import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/services/cacheService';

/**
 * Admin Clean API
 * Allows cleaning test data and maintaining clean production data
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action !== 'clean_test_data') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    console.log('🧹 Starting test data cleanup...');

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // Define test FIDs that should be cleaned
      const testFids = [
        546204, // Original mock FID
        999999, // Common test FID
        123456, // Another test FID
      ];

      // Get active raffle
      const raffleResult = await pool.query(`
        SELECT id FROM raffles 
        WHERE status = 'ACTIVE' 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (raffleResult.rows.length === 0) {
        await pool.end();
        return NextResponse.json(
          { error: 'No active raffle found' },
          { status: 400 }
        );
      }

      const raffleId = raffleResult.rows[0].id;

      // 1. Clean test user tickets
      console.log('🗑️ Cleaning test user tickets...');
      const cleanTicketsResult = await pool.query(`
        DELETE FROM user_tickets 
        WHERE "raffleId" = $1 
        AND "userFid" = ANY($2::bigint[])
        RETURNING "userFid", "ticketsCount"
      `, [raffleId, testFids]);

      const cleanedTickets = cleanTicketsResult.rows;

      // 2. Clean engagement logs for test FIDs
      console.log('🗑️ Cleaning test engagement logs...');
      const cleanEngagementResult = await pool.query(`
        DELETE FROM engagement_log 
        WHERE raffle_id = $1 
        AND user_fid = ANY($2::bigint[])
        RETURNING user_fid
      `, [raffleId, testFids]);

      const cleanedEngagement = cleanEngagementResult.rows;

      // 3. Update raffle totals after cleanup
      console.log('📊 Updating raffle totals...');
      await pool.query(`
        UPDATE raffles SET 
          "totalTickets" = (
            SELECT COALESCE(SUM("ticketsCount"), 0) 
            FROM user_tickets 
            WHERE "raffleId" = $1
          ),
          "totalParticipants" = (
            SELECT COUNT(DISTINCT "userFid") 
            FROM user_tickets 
            WHERE "raffleId" = $1
          )
        WHERE id = $1
      `, [raffleId]);

      // 4. Invalidate cache after cleanup
      console.log('🗑️ Invalidating cache...');
      await CacheService.invalidateRaffleCache(raffleId);
      
      // Invalidate cache for cleaned test FIDs
      for (const fid of testFids) {
        await CacheService.invalidateUserCache(fid.toString());
      }

      await pool.end();

      return NextResponse.json({
        success: true,
        message: 'Test data cleaned successfully',
        data: {
          cleanedTickets: cleanedTickets.length,
          cleanedEngagement: cleanedEngagement.length,
          testFidsProcessed: testFids,
          raffleId
        }
      });

    } finally {
      try {
        await pool.end();
      } catch (e) {
        // Ignore pool end errors
      }
    }

  } catch (error) {
    console.error('❌ Clean data error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clean test data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to show what would be cleaned
 */
export async function GET(request: NextRequest) {
  try {
    const testFids = [546204, 999999, 123456];

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // Get active raffle
      const raffleResult = await pool.query(`
        SELECT id FROM raffles 
        WHERE status = 'ACTIVE' 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (raffleResult.rows.length === 0) {
        await pool.end();
        return NextResponse.json({
          success: true,
          data: {
            testFids,
            willClean: 0,
            message: 'No active raffle found'
          }
        });
      }

      const raffleId = raffleResult.rows[0].id;

      // Check what would be cleaned
      const checkResult = await pool.query(`
        SELECT "userFid", "ticketsCount"
        FROM user_tickets 
        WHERE "raffleId" = $1 
        AND "userFid" = ANY($2::bigint[])
      `, [raffleId, testFids]);

      await pool.end();

      return NextResponse.json({
        success: true,
        data: {
          testFids,
          willClean: checkResult.rows.length,
          testData: checkResult.rows.map((row: any) => ({
            userFid: row.userFid.toString(),
            tickets: row.ticketsCount
          })),
          message: `Found ${checkResult.rows.length} test entries to clean`
        }
      });

    } finally {
      try {
        await pool.end();
      } catch (e) {
        // Ignore pool end errors
      }
    }

  } catch (error) {
    console.error('❌ Check clean data error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check test data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}