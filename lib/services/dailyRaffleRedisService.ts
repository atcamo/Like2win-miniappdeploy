/**
 * Daily Raffle Service with Redis (Upstash) for persistent storage
 * Replaces in-memory service for production Vercel environment
 */

import { Redis } from '@upstash/redis';

interface UserTickets {
  fid: number;
  tickets: number;
  lastActivity: string;
  engagements: string[];
}

interface DailyRaffleStats {
  totalTickets: number;
  totalParticipants: number;
  lastUpdated: string;
}

class DailyRaffleRedisService {
  private redis: Redis | null = null;
  private isRedisAvailable = false;

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    try {
      if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
        this.redis = new Redis({
          url: process.env.REDIS_URL,
          token: process.env.REDIS_TOKEN,
        });
        this.isRedisAvailable = true;
        console.log('🔗 Redis connected for daily raffle service');
      } else {
        console.log('⚠️ Redis credentials not available - using fallback mode');
      }
    } catch (error) {
      console.log('⚠️ Redis connection failed:', error);
      this.isRedisAvailable = false;
    }
  }

  private getCurrentDateStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDailyKey(suffix: string): string {
    const today = this.getCurrentDateStr();
    return `like2win:daily:${today}:${suffix}`;
  }

  private getUserKey(fid: number): string {
    return this.getDailyKey(`user:${fid}`);
  }

  private getStatsKey(): string {
    return this.getDailyKey('stats');
  }

  // Set TTL to end of day UTC (auto-cleanup)
  private getSecondsUntilMidnightUTC(): number {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return Math.ceil((tomorrow.getTime() - now.getTime()) / 1000);
  }

  async addTickets(userFid: number, ticketsToAdd: number, activity: string = 'participate'): Promise<UserTickets> {
    if (!this.isRedisAvailable || !this.redis) {
      // Fallback for development/testing
      return {
        fid: userFid,
        tickets: ticketsToAdd,
        lastActivity: new Date().toISOString(),
        engagements: [activity]
      };
    }

    try {
      const userKey = this.getUserKey(userFid);
      const statsKey = this.getStatsKey();
      const ttl = this.getSecondsUntilMidnightUTC();

      // Get existing user data
      const existingUser = await this.redis.get(userKey) as UserTickets | null;
      
      let newUser: UserTickets;
      let isNewParticipant = false;

      if (existingUser) {
        // Update existing user
        newUser = {
          ...existingUser,
          tickets: existingUser.tickets + ticketsToAdd,
          lastActivity: new Date().toISOString(),
          engagements: [...existingUser.engagements, activity]
        };
      } else {
        // New user
        isNewParticipant = true;
        newUser = {
          fid: userFid,
          tickets: ticketsToAdd,
          lastActivity: new Date().toISOString(),
          engagements: [activity]
        };
      }

      // Save user data with TTL
      await this.redis.setex(userKey, ttl, JSON.stringify(newUser));

      // Update stats atomically
      const existingStats = await this.redis.get(statsKey) as DailyRaffleStats | null;
      const newStats: DailyRaffleStats = {
        totalTickets: (existingStats?.totalTickets || 0) + ticketsToAdd,
        totalParticipants: (existingStats?.totalParticipants || 0) + (isNewParticipant ? 1 : 0),
        lastUpdated: new Date().toISOString()
      };

      await this.redis.setex(statsKey, ttl, JSON.stringify(newStats));

      console.log(`🎫 Redis: User ${userFid} +${ticketsToAdd} tickets (total: ${newUser.tickets}) [${isNewParticipant ? 'new' : 'existing'} participant]`);
      
      return newUser;

    } catch (error) {
      console.error('❌ Redis addTickets error:', error);
      // Return fallback data
      return {
        fid: userFid,
        tickets: ticketsToAdd,
        lastActivity: new Date().toISOString(),
        engagements: [activity]
      };
    }
  }

  async getUserTickets(userFid: number): Promise<UserTickets | null> {
    if (!this.isRedisAvailable || !this.redis) {
      return null;
    }

    try {
      const userKey = this.getUserKey(userFid);
      const userData = await this.redis.get(userKey) as UserTickets | null;
      return userData;
    } catch (error) {
      console.error('❌ Redis getUserTickets error:', error);
      return null;
    }
  }

  async getTotalStats(): Promise<{ totalTickets: number; totalParticipants: number }> {
    if (!this.isRedisAvailable || !this.redis) {
      return { totalTickets: 0, totalParticipants: 0 };
    }

    try {
      const statsKey = this.getStatsKey();
      const stats = await this.redis.get(statsKey) as DailyRaffleStats | null;
      return {
        totalTickets: stats?.totalTickets || 0,
        totalParticipants: stats?.totalParticipants || 0
      };
    } catch (error) {
      console.error('❌ Redis getTotalStats error:', error);
      return { totalTickets: 0, totalParticipants: 0 };
    }
  }

  async getLeaderboard(limit: number = 50): Promise<Array<UserTickets & { rank: number; isTopThree: boolean }>> {
    if (!this.isRedisAvailable || !this.redis) {
      return [];
    }

    try {
      const today = this.getCurrentDateStr();
      const pattern = `like2win:daily:${today}:user:*`;
      
      // Get all user keys for today
      const userKeys = await this.redis.keys(pattern);
      
      if (userKeys.length === 0) {
        return [];
      }

      // Get all user data
      const usersData = await this.redis.mget(...userKeys);
      
      // Parse and sort users
      const users = usersData
        .filter(data => data !== null)
        .map(data => {
          try {
            // Handle both string and object data from Redis
            if (typeof data === 'string') {
              return JSON.parse(data) as UserTickets;
            } else if (typeof data === 'object') {
              return data as UserTickets;
            } else {
              console.warn('Unexpected Redis data type:', typeof data, data);
              return null;
            }
          } catch (error) {
            console.error('Redis JSON parse error:', error, 'Data:', data);
            return null;
          }
        })
        .filter(user => user !== null)
        .sort((a, b) => b.tickets - a.tickets)
        .slice(0, limit)
        .map((user, index) => ({
          ...user,
          rank: index + 1,
          isTopThree: index < 3
        }));

      return users;

    } catch (error) {
      console.error('❌ Redis getLeaderboard error:', error);
      return [];
    }
  }

  getRaffleInfo() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const endOfDayUTC = new Date(`${todayStr}T23:59:59.999Z`);
    
    return {
      id: `daily-raffle-${todayStr}`,
      date: todayStr,
      weekPeriod: `Daily Raffle - ${todayStr}`,
      startDate: `${todayStr}T00:01:00.000Z`,
      endDate: endOfDayUTC.toISOString(),
      status: 'ACTIVE' as const,
      timeRemaining: {
        total: Math.max(0, endOfDayUTC.getTime() - Date.now()),
        hours: Math.floor(Math.max(0, endOfDayUTC.getTime() - Date.now()) / (1000 * 60 * 60)),
        minutes: Math.floor((Math.max(0, endOfDayUTC.getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60))
      }
    };
  }

  async removeUser(userFid: number): Promise<boolean> {
    if (!this.isRedisAvailable || !this.redis) {
      return false;
    }

    try {
      const userKey = this.getUserKey(userFid);
      const user = await this.getUserTickets(userFid);
      
      if (user) {
        await this.redis.del(userKey);
        
        // Update stats
        const statsKey = this.getStatsKey();
        const stats = await this.redis.get(statsKey) as DailyRaffleStats | null;
        
        if (stats) {
          const newStats: DailyRaffleStats = {
            totalTickets: Math.max(0, stats.totalTickets - user.tickets),
            totalParticipants: Math.max(0, stats.totalParticipants - 1),
            lastUpdated: new Date().toISOString()
          };
          
          const ttl = this.getSecondsUntilMidnightUTC();
          await this.redis.setex(statsKey, ttl, JSON.stringify(newStats));
        }
        
        console.log(`🗑️ Redis: Removed user ${userFid} (had ${user.tickets} tickets)`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Redis removeUser error:', error);
      return false;
    }
  }

  async clearMockUsers(): Promise<number> {
    const mockFids = [12345, 67890, 11111, 22222, 99999, 123456, 546204, 999999, 987654, 999888];
    let removedCount = 0;
    
    for (const fid of mockFids) {
      if (await this.removeUser(fid)) {
        removedCount++;
      }
    }
    
    console.log(`🧹 Redis: Cleared ${removedCount} mock users from daily raffle`);
    return removedCount;
  }

  // Debug method
  async getDebugInfo() {
    const stats = await this.getTotalStats();
    const leaderboard = await this.getLeaderboard(10);
    
    return {
      currentDate: this.getCurrentDateStr(),
      redisAvailable: this.isRedisAvailable,
      totalParticipants: stats.totalParticipants,
      totalTickets: stats.totalTickets,
      topUsers: leaderboard.slice(0, 5)
    };
  }
}

// Export singleton instance
export const dailyRaffleRedisService = new DailyRaffleRedisService();