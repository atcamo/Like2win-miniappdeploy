/**
 * Like2Win Engagement Service
 * Handles automatic detection and processing of user engagement during active raffle periods
 */

interface EngagementEvent {
  type: 'like' | 'recast' | 'comment';
  userFid: string;
  castHash: string;
  timestamp: Date;
  authorFid?: string;
}

interface ActiveRaffle {
  id: string;
  weekPeriod: string;
  startDate: Date;
  endDate: Date;
  status: string;
  totalTickets: number;
  totalParticipants: number;
}

export class EngagementService {
  
  /**
   * Check if there's an active raffle and if the engagement happened during its period
   */
  static async isEngagementValidForCurrentRaffle(timestamp: Date): Promise<ActiveRaffle | null> {
    try {
      // Get current active raffle
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1
      });

      const result = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate", status, "totalTickets", "totalParticipants"
        FROM raffles 
        WHERE status = 'ACTIVE' 
        AND "startDate" <= $1 
        AND "endDate" >= $1
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `, [timestamp]);

      await pool.end();

      if (result.rows.length === 0) {
        console.log('⚠️ No active raffle found for timestamp:', timestamp);
        return null;
      }

      const raffle = result.rows[0];
      console.log('✅ Found active raffle:', raffle.id, 'for period:', raffle.weekPeriod);
      
      return {
        id: raffle.id,
        weekPeriod: raffle.weekPeriod,
        startDate: new Date(raffle.startDate),
        endDate: new Date(raffle.endDate),
        status: raffle.status,
        totalTickets: raffle.totalTickets,
        totalParticipants: raffle.totalParticipants
      };

    } catch (error) {
      console.error('❌ Error checking active raffle:', error);
      return null;
    }
  }

  /**
   * Process a like event and award tickets if valid
   */
  static async processLikeEvent(event: EngagementEvent): Promise<{
    success: boolean;
    message: string;
    ticketsAwarded?: number;
    totalTickets?: number;
  }> {
    try {
      console.log('🎯 Processing like event:', { 
        userFid: event.userFid, 
        castHash: event.castHash,
        timestamp: event.timestamp 
      });

      // 1. Check if there's an active raffle for this timestamp
      const activeRaffle = await this.isEngagementValidForCurrentRaffle(event.timestamp);
      
      if (!activeRaffle) {
        return {
          success: false,
          message: 'No active raffle found for this timestamp'
        };
      }

      // 2. Check if user is already following @Like2Win (future feature)
      // For now, we'll assume they are following

      // 3. Check if this like was already processed
      const alreadyProcessed = await this.isEngagementAlreadyProcessed(
        event.userFid, 
        event.castHash, 
        'like'
      );

      if (alreadyProcessed) {
        return {
          success: false,
          message: 'Like already processed for this user and cast'
        };
      }

      // 4. Award tickets for the like
      const ticketsAwarded = await this.awardTicketsForEngagement(
        event.userFid,
        activeRaffle.id,
        'like',
        event.castHash,
        event.timestamp
      );

      if (ticketsAwarded > 0) {
        // 5. Update raffle totals
        await this.updateRaffleTotals(activeRaffle.id);
        
        // 6. Get user's new total
        const userTotal = await this.getUserTotalTickets(event.userFid, activeRaffle.id);

        return {
          success: true,
          message: `Tickets awarded for like during ${activeRaffle.weekPeriod}`,
          ticketsAwarded,
          totalTickets: userTotal
        };
      } else {
        return {
          success: false,
          message: 'Failed to award tickets'
        };
      }

    } catch (error) {
      console.error('❌ Error processing like event:', error);
      return {
        success: false,
        message: 'Internal error processing like'
      };
    }
  }

  /**
   * Check if engagement was already processed
   */
  private static async isEngagementAlreadyProcessed(
    userFid: string, 
    castHash: string, 
    type: string
  ): Promise<boolean> {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1
      });

      const result = await pool.query(`
        SELECT id FROM engagement_log 
        WHERE user_fid = $1 AND cast_hash = $2 AND (
          (has_liked = true AND $3 = 'like') OR
          (has_commented = true AND $3 = 'comment') OR
          (has_recasted = true AND $3 = 'recast')
        )
        LIMIT 1
      `, [parseInt(userFid), castHash, type]);

      await pool.end();
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('❌ Error checking engagement processing:', error);
      return false;
    }
  }

  /**
   * Award tickets for valid engagement - SIMPLIFIED VERSION
   */
  private static async awardTicketsForEngagement(
    userFid: string,
    raffleId: string,
    engagementType: string,
    castHash: string,
    timestamp: Date
  ): Promise<number> {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1
      });

      // Define tickets per engagement type
      const ticketsPerEngagement = {
        'like': 1,
        'recast': 2,
        'comment': 3
      };

      const ticketsToAward = ticketsPerEngagement[engagementType as keyof typeof ticketsPerEngagement] || 1;
      const userFidBigInt = parseInt(userFid);

      console.log(`🎫 Awarding ${ticketsToAward} tickets to user ${userFidBigInt} for ${engagementType}`);

      // SIMPLIFIED: Just award tickets (skip engagement_log and users for now)
      const result = await pool.query(`
        INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount")
        VALUES ($1, $2, $3)
        ON CONFLICT ("raffleId", "userFid") 
        DO UPDATE SET "ticketsCount" = user_tickets."ticketsCount" + $3
        RETURNING "ticketsCount"
      `, [raffleId, userFidBigInt, ticketsToAward]);

      await pool.end();

      const newTicketCount = result.rows[0]?.ticketsCount || 0;
      console.log(`✅ Success! User ${userFidBigInt} now has ${newTicketCount} total tickets`);
      
      return ticketsToAward;

    } catch (error) {
      console.error('❌ Error awarding tickets:', {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        detail: (error as any)?.detail
      });
      return 0;
    }
  }

  /**
   * Update raffle totals after ticket changes
   */
  private static async updateRaffleTotals(raffleId: string): Promise<void> {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1
      });

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

      await pool.end();
      console.log('✅ Updated raffle totals for raffle:', raffleId);

    } catch (error) {
      console.error('❌ Error updating raffle totals:', error);
    }
  }

  /**
   * Get user's total tickets for a raffle
   */
  private static async getUserTotalTickets(userFid: string, raffleId: string): Promise<number> {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1
      });

      const result = await pool.query(`
        SELECT "ticketsCount" FROM user_tickets 
        WHERE "raffleId" = $1 AND "userFid" = $2
      `, [raffleId, parseInt(userFid)]);

      await pool.end();
      
      return result.rows.length > 0 ? parseInt(result.rows[0].ticketsCount) : 0;
    } catch (error) {
      console.error('❌ Error getting user total tickets:', error);
      return 0;
    }
  }

  /**
   * Get current active raffle info (for client display)
   */
  static async getCurrentRaffleInfo(): Promise<ActiveRaffle | null> {
    return await this.isEngagementValidForCurrentRaffle(new Date());
  }
}