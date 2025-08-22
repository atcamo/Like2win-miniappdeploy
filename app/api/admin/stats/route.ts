import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/services/cacheService';
import { BackgroundSyncService } from '@/lib/services/backgroundSync';
import { userService } from '@/lib/services/userService';

/**
 * Admin Stats API
 * Provides real-time statistics for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Loading admin stats...');

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // 1. Get current raffle
      const raffleResult = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate", status, "totalTickets", "totalParticipants"
        FROM raffles 
        WHERE status = 'ACTIVE' 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      const currentRaffle = raffleResult.rows.length > 0 ? {
        id: raffleResult.rows[0].id,
        weekPeriod: raffleResult.rows[0].weekPeriod,
        startDate: raffleResult.rows[0].startDate.toISOString(),
        endDate: raffleResult.rows[0].endDate.toISOString(),
        status: raffleResult.rows[0].status,
        totalTickets: raffleResult.rows[0].totalTickets || 0,
        totalParticipants: raffleResult.rows[0].totalParticipants || 0
      } : null;

      // 2. Get top users with more details for leaderboard
      let topUsers = [];
      if (currentRaffle) {
        const topUsersResult = await pool.query(`
          SELECT "userFid", "ticketsCount"
          FROM user_tickets 
          WHERE "raffleId" = $1
          AND "ticketsCount" > 0
          ORDER BY "ticketsCount" DESC, "userFid" ASC
          LIMIT 50
        `, [currentRaffle.id]);

        const topUsersRaw = topUsersResult.rows.map((row: any, index: number) => ({
          rank: index + 1,
          userFid: row.userFid.toString(),
          ticketsCount: row.ticketsCount || 0,
          isTopThree: index < 3
        }));

        // Resolve FIDs to usernames
        const fids = topUsersRaw.map(user => user.userFid);
        const userDetails = await userService.resolveUsers(fids);

        topUsers = topUsersRaw.map(user => ({
          ...user,
          username: userDetails[user.userFid]?.username || `fid${user.userFid}`,
          displayName: userDetails[user.userFid]?.displayName || `User ${user.userFid}`,
          pfpUrl: userDetails[user.userFid]?.pfpUrl || ''
        }));
      }

      // 3. Get total users count
      const totalUsersResult = await pool.query(`
        SELECT COUNT(DISTINCT "userFid") as count
        FROM user_tickets
        WHERE "ticketsCount" > 0
      `);
      const totalUsers = parseInt(totalUsersResult.rows[0]?.count || '0');

      // 4. Get system health
      const cacheStats = await CacheService.getCacheStats();
      const syncStatus = BackgroundSyncService.getStatus();

      const systemHealth = {
        cache: cacheStats.redisHealthy,
        database: true, // If we got here, DB is working
        background: syncStatus.isRunning
      };

      await pool.end();

      return NextResponse.json({
        success: true,
        data: {
          currentRaffle,
          topUsers,
          totalUsers,
          systemHealth,
          lastUpdated: new Date().toISOString()
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
    console.error('❌ Admin stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load admin stats',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}