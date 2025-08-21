/**
 * Like2Win Background Sync Service
 * Periodically syncs data from PostgreSQL to Redis cache
 */

import { CacheService } from './cacheService';

interface DatabaseConnection {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
  end: () => Promise<void>;
}

export class BackgroundSyncService {
  private static isRunning = false;
  private static syncInterval: NodeJS.Timeout | null = null;
  private static readonly SYNC_INTERVAL_MS = 30000; // 30 seconds

  /**
   * Start the background sync process
   */
  static start(): void {
    if (this.isRunning) {
      console.log('⚠️ Background sync already running');
      return;
    }

    console.log('🚀 Starting background sync service...');
    this.isRunning = true;

    // Run initial sync immediately
    this.performSync().catch(error => {
      console.error('❌ Initial sync failed:', error);
    });

    // Schedule periodic syncs
    this.syncInterval = setInterval(() => {
      this.performSync().catch(error => {
        console.error('❌ Periodic sync failed:', error);
      });
    }, this.SYNC_INTERVAL_MS);

    console.log(`✅ Background sync started (every ${this.SYNC_INTERVAL_MS / 1000}s)`);
  }

  /**
   * Stop the background sync process
   */
  static stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Background sync not running');
      return;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isRunning = false;
    console.log('⏹️ Background sync stopped');
  }

  /**
   * Perform a complete sync cycle
   */
  private static async performSync(): Promise<void> {
    // Check if another sync is already running
    const lockAcquired = await CacheService.setSyncLock();
    if (!lockAcquired) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    const syncStartTime = Date.now();
    console.log('🔄 Starting background sync...');

    try {
      // 1. Sync active raffle data
      await this.syncActiveRaffle();

      // 2. Sync user ticket data for recent users
      await this.syncRecentUserTickets();

      // 3. Sync leaderboard
      await this.syncLeaderboard();

      // 4. Update last sync timestamp
      await CacheService.updateLastSync();

      const syncDuration = Date.now() - syncStartTime;
      console.log(`✅ Background sync completed in ${syncDuration}ms`);

    } catch (error) {
      console.error('❌ Background sync failed:', error);
    } finally {
      // Always release the lock
      await CacheService.releaseSyncLock();
    }
  }

  /**
   * Sync active raffle data
   */
  private static async syncActiveRaffle(): Promise<void> {
    const pool = await this.createDatabaseConnection();
    
    try {
      const result = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate", status, "totalTickets", "totalParticipants"
        FROM raffles 
        WHERE status = 'ACTIVE' 
        AND "startDate" <= NOW() 
        AND "endDate" >= NOW()
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (result.rows.length > 0) {
        const raffle = result.rows[0];
        await CacheService.cacheActiveRaffle({
          id: raffle.id,
          weekPeriod: raffle.weekPeriod,
          startDate: raffle.startDate.toISOString(),
          endDate: raffle.endDate.toISOString(),
          status: raffle.status,
          totalTickets: raffle.totalTickets || 0,
          totalParticipants: raffle.totalParticipants || 0
        });

        console.log(`📊 Synced active raffle: ${raffle.id} (${raffle.weekPeriod})`);
      } else {
        console.log('⚠️ No active raffle found');
      }
    } finally {
      await pool.end();
    }
  }

  /**
   * Sync user ticket data for users who have been active recently
   */
  private static async syncRecentUserTickets(): Promise<void> {
    const pool = await this.createDatabaseConnection();
    
    try {
      // Get active raffle first
      const raffleResult = await pool.query(`
        SELECT id FROM raffles 
        WHERE status = 'ACTIVE' 
        AND "startDate" <= NOW() 
        AND "endDate" >= NOW()
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (raffleResult.rows.length === 0) {
        console.log('⚠️ No active raffle for user ticket sync');
        return;
      }

      const raffleId = raffleResult.rows[0].id;

      // Get recent user tickets (updated in last 24 hours or with activity)
      const userTicketsResult = await pool.query(`
        SELECT "userFid", "ticketsCount", "updatedAt"
        FROM user_tickets 
        WHERE "raffleId" = $1
        AND ("updatedAt" > NOW() - INTERVAL '24 hours' OR "ticketsCount" > 0)
        ORDER BY "updatedAt" DESC
        LIMIT 100
      `, [raffleId]);

      let syncedUsers = 0;
      for (const userTicket of userTicketsResult.rows) {
        await CacheService.cacheUserStatus(
          userTicket.userFid.toString(),
          userTicket.ticketsCount || 0,
          raffleId,
          1800 // 30 minutes TTL
        );
        syncedUsers++;
      }

      console.log(`👥 Synced ${syncedUsers} user ticket records`);
    } finally {
      await pool.end();
    }
  }

  /**
   * Sync leaderboard data
   */
  private static async syncLeaderboard(): Promise<void> {
    const pool = await this.createDatabaseConnection();
    
    try {
      // Get active raffle
      const raffleResult = await pool.query(`
        SELECT id FROM raffles 
        WHERE status = 'ACTIVE' 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (raffleResult.rows.length === 0) {
        console.log('⚠️ No active raffle for leaderboard sync');
        return;
      }

      const raffleId = raffleResult.rows[0].id;

      // Get top users by ticket count
      const leaderboardResult = await pool.query(`
        SELECT ut."userFid", ut."ticketsCount"
        FROM user_tickets ut
        WHERE ut."raffleId" = $1
        AND ut."ticketsCount" > 0
        ORDER BY ut."ticketsCount" DESC, ut."updatedAt" ASC
        LIMIT 50
      `, [raffleId]);

      const leaderboard = leaderboardResult.rows.map((row, index) => ({
        rank: index + 1,
        fid: row.userFid.toString(),
        tickets: row.ticketsCount || 0
      }));

      await CacheService.cacheLeaderboard(raffleId, leaderboard, 300); // 5 minutes TTL

      console.log(`🏆 Synced leaderboard: ${leaderboard.length} entries`);
    } finally {
      await pool.end();
    }
  }

  /**
   * Create database connection
   */
  private static async createDatabaseConnection(): Promise<DatabaseConnection> {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    return pool;
  }

  /**
   * Perform manual sync (for testing/debugging)
   */
  static async manualSync(): Promise<{
    success: boolean;
    duration: number;
    error?: string;
  }> {
    const syncStartTime = Date.now();
    
    try {
      await this.performSync();
      const duration = Date.now() - syncStartTime;
      
      return {
        success: true,
        duration
      };
    } catch (error) {
      const duration = Date.now() - syncStartTime;
      return {
        success: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get sync service status
   */
  static getStatus(): {
    isRunning: boolean;
    intervalMs: number;
    hasInterval: boolean;
  } {
    return {
      isRunning: this.isRunning,
      intervalMs: this.SYNC_INTERVAL_MS,
      hasInterval: this.syncInterval !== null
    };
  }

  /**
   * Force sync specific user data
   */
  static async syncUserData(userFid: string): Promise<boolean> {
    const pool = await this.createDatabaseConnection();
    
    try {
      // Get active raffle
      const raffleResult = await pool.query(`
        SELECT id FROM raffles 
        WHERE status = 'ACTIVE' 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (raffleResult.rows.length === 0) {
        console.log('⚠️ No active raffle for user sync');
        return false;
      }

      const raffleId = raffleResult.rows[0].id;

      // Get user's current tickets
      const userResult = await pool.query(`
        SELECT "ticketsCount" FROM user_tickets 
        WHERE "raffleId" = $1 AND "userFid" = $2
      `, [raffleId, parseInt(userFid)]);

      const ticketsCount = userResult.rows.length > 0 ? userResult.rows[0].ticketsCount : 0;

      // Cache the user data
      await CacheService.cacheUserStatus(userFid, ticketsCount || 0, raffleId);

      console.log(`🔄 Force synced user ${userFid}: ${ticketsCount} tickets`);
      return true;
    } catch (error) {
      console.error('❌ Force sync user failed:', error);
      return false;
    } finally {
      await pool.end();
    }
  }
}