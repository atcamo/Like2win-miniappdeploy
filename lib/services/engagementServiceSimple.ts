/**
 * Simplified Engagement Service for Debugging
 * Step-by-step processing to identify the exact error
 */

interface EngagementEvent {
  type: 'like' | 'recast' | 'comment';
  userFid: string;
  castHash: string;
  timestamp: Date;
  authorFid?: string;
}

export class SimpleEngagementService {
  
  /**
   * Test each database operation separately
   */
  static async testDatabaseOperations(userFid: string, raffleId: string): Promise<{
    step: string;
    success: boolean;
    error?: string;
  }[]> {
    const results: Array<{ step: string; success: boolean; error?: string }> = [];
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // Step 1: Test basic connection
      try {
        await pool.query('SELECT 1');
        results.push({ step: '1. Database Connection', success: true });
      } catch (error) {
        results.push({ 
          step: '1. Database Connection', 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        });
        await pool.end();
        return results;
      }

      // Step 2: Test user insertion
      try {
        const userFidBigInt = parseInt(userFid);
        await pool.query(`
          INSERT INTO users (fid, created_at)
          VALUES ($1, $2)
          ON CONFLICT (fid) DO NOTHING
        `, [userFidBigInt, new Date()]);
        results.push({ step: '2. User Creation', success: true });
      } catch (error) {
        results.push({ 
          step: '2. User Creation', 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Step 3: Test engagement_log insertion
      try {
        const userFidBigInt = parseInt(userFid);
        await pool.query(`
          INSERT INTO engagement_log (raffle_id, user_fid, cast_hash, has_liked, has_commented, has_recasted, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [raffleId, userFidBigInt, 'test_cast_debug', true, false, false, new Date()]);
        results.push({ step: '3. Engagement Log', success: true });
      } catch (error) {
        results.push({ 
          step: '3. Engagement Log', 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Step 4: Test user_tickets insertion
      try {
        const userFidBigInt = parseInt(userFid);
        await pool.query(`
          INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount")
          VALUES ($1, $2, $3)
          ON CONFLICT ("raffleId", "userFid") 
          DO UPDATE SET "ticketsCount" = user_tickets."ticketsCount" + $3
        `, [raffleId, userFidBigInt, 1]);
        results.push({ step: '4. User Tickets', success: true });
      } catch (error) {
        results.push({ 
          step: '4. User Tickets', 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        });
      }

      await pool.end();
      return results;

    } catch (error) {
      results.push({ 
        step: 'General Error', 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
      await pool.end();
      return results;
    }
  }

  /**
   * Simple ticket awarding without complex logic
   */
  static async awardTicketSimple(userFid: string, raffleId: string, castHash: string): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    console.log(`🎯 Simple ticket award for user ${userFid}`);
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      const userFidBigInt = parseInt(userFid);
      const timestamp = new Date();

      // Start transaction
      await pool.query('BEGIN');

      try {
        // Just add ticket, skip other operations for testing
        console.log(`📝 Adding ticket for user ${userFidBigInt}...`);
        
        const result = await pool.query(`
          INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount")
          VALUES ($1, $2, 1)
          ON CONFLICT ("raffleId", "userFid") 
          DO UPDATE SET "ticketsCount" = user_tickets."ticketsCount" + 1
          RETURNING "ticketsCount"
        `, [raffleId, userFidBigInt]);

        await pool.query('COMMIT');
        await pool.end();

        const newTicketCount = result.rows[0]?.ticketsCount || 0;
        console.log(`✅ Success! User now has ${newTicketCount} tickets`);

        return {
          success: true,
          message: `Ticket awarded successfully`,
          details: {
            newTicketCount,
            userFid: userFidBigInt,
            raffleId
          }
        };

      } catch (innerError) {
        await pool.query('ROLLBACK');
        await pool.end();
        throw innerError;
      }

    } catch (error) {
      console.error('❌ Simple ticket award error:', error);
      return {
        success: false,
        message: 'Failed to award ticket',
        details: {
          error: error instanceof Error ? error.message : String(error),
          code: (error as any)?.code,
          detail: (error as any)?.detail
        }
      };
    }
  }
}