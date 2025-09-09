import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleRedisService } from '@/lib/services/dailyRaffleRedisService';

/**
 * Admin Stats API
 * Provides real-time statistics for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Loading admin stats...');

    // Try local data first
    try {
      const { readFileSync, existsSync } = require('fs');
      const { join } = require('path');
      
      const dataPath = join(process.cwd(), 'data');
      const userTicketsFile = join(dataPath, 'local-user-tickets.json');
      const raffleDataFile = join(dataPath, 'local-raffle-data.json');

      if (existsSync(userTicketsFile) && existsSync(raffleDataFile)) {
        console.log('✅ Loading admin stats from local data...');
        
        const userTickets = JSON.parse(readFileSync(userTicketsFile, 'utf8'));
        const raffleData = JSON.parse(readFileSync(raffleDataFile, 'utf8'));
        
        // Create current raffle data
        const currentRaffle = {
          id: raffleData.id || 'local-raffle-2025',
          weekPeriod: raffleData.weekPeriod || 'Week 34-37 2025 (Launch Raffle)',
          startDate: raffleData.startDate || '2025-08-18T00:00:00.000Z',
          endDate: raffleData.endDate || (() => {
            // Calculate next daily raffle end (today at 23:59:59 UTC)
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            // If it's already past today's deadline, set for tomorrow
            if (now > today) {
              today.setDate(today.getDate() + 1);
            }
            return today.toISOString();
          })(),
          status: 'ACTIVE',
          totalTickets: raffleData.totalTickets || 0,
          totalParticipants: raffleData.totalParticipants || 0
        };

        // Create leaderboard
        const topUsers = Object.entries(userTickets)
          .map(([fid, data]: [string, any]) => ({
            userFid: fid,
            username: data.username || `user_${fid}`,
            displayName: data.username || `User ${fid}`,
            pfpUrl: '', // No PFP data in local storage
            ticketsCount: data.tickets
          }))
          .sort((a, b) => b.ticketsCount - a.ticketsCount)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
            isTopThree: index < 3
          }));

        console.log(`🏆 Loaded ${topUsers.length} users from local data`);

        return NextResponse.json({
          success: true,
          source: 'local_data',
          data: {
            currentRaffle,
            topUsers,
            totalUsers: Object.keys(userTickets).length,
            systemHealth: {
              cache: false, // No cache in local mode
              database: false, // No database in local mode
              background: false // No background sync in local mode
            },
            lastUpdated: raffleData.lastUpdated || new Date().toISOString()
          }
        });
      }
    } catch (localError) {
      console.log('⚠️ Local data not available:', localError);
    }

    // Use Redis-based daily raffle service for real-time data
    console.log('⚡ Using Redis daily raffle service for admin stats...');

    const raffleInfo = dailyRaffleRedisService.getRaffleInfo();
    const stats = await dailyRaffleRedisService.getTotalStats();
    const leaderboard = await dailyRaffleRedisService.getLeaderboard(50);
    
    // Create current daily raffle data
    const currentRaffle = {
      id: raffleInfo.id,
      weekPeriod: raffleInfo.weekPeriod,
      startDate: raffleInfo.startDate,
      endDate: raffleInfo.endDate,
      status: raffleInfo.status,
      totalTickets: stats.totalTickets,
      totalParticipants: stats.totalParticipants
    };

    // Convert leaderboard to admin format
    const topUsers = leaderboard.map((user) => ({
      rank: user.rank,
      userFid: user.fid.toString(),
      username: `user_${user.fid}`,
      displayName: `User ${user.fid}`,
      pfpUrl: '', // No PFP data in Redis service
      ticketsCount: user.tickets,
      isTopThree: user.isTopThree
    }));

    // System health - Redis service status
    const debugInfo = await dailyRaffleRedisService.getDebugInfo();
    const systemHealth = {
      cache: debugInfo.redisAvailable, // Redis is our cache/storage
      database: debugInfo.redisAvailable, // Redis as persistent storage
      background: false // No background sync needed with Redis
    };

    console.log(`✅ Redis daily raffle admin data: ${stats.totalParticipants} participants, ${stats.totalTickets} tickets`);

    return NextResponse.json({
      success: true,
      source: 'redis_daily_service',
      data: {
        currentRaffle,
        topUsers,
        totalUsers: stats.totalParticipants,
        systemHealth,
        lastUpdated: new Date().toISOString()
      }
    });

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