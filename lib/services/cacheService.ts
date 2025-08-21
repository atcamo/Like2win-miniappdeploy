/**
 * Like2Win Cache Service
 * Manages Redis caching for user tickets, raffle data, and leaderboards
 */

import { Redis } from '@upstash/redis';

interface CachedUserData {
  fid: string;
  currentTickets: number;
  lastUpdated: string;
  raffleId: string;
}

interface CachedRaffleData {
  id: string;
  weekPeriod: string;
  startDate: string;
  endDate: string;
  status: string;
  totalTickets: number;
  totalParticipants: number;
  lastUpdated: string;
}

interface CachedLeaderboard {
  rank: number;
  fid: string;
  tickets: number;
  username?: string;
}

export class CacheService {
  private static redis: Redis | null = null;

  /**
   * Initialize Redis connection
   */
  private static getRedis(): Redis {
    if (!this.redis) {
      this.redis = new Redis({
        url: process.env.REDIS_URL!,
        token: process.env.REDIS_TOKEN!,
      });
    }
    return this.redis;
  }

  /**
   * Cache Keys
   */
  private static keys = {
    userTickets: (fid: string, raffleId: string) => `user:${fid}:raffle:${raffleId}:tickets`,
    userStatus: (fid: string) => `user:${fid}:status`,
    activeRaffle: () => 'raffle:active',
    leaderboard: (raffleId: string) => `raffle:${raffleId}:leaderboard`,
    syncLock: () => 'sync:lock',
    lastSync: () => 'sync:last',
  };

  /**
   * Get user's current ticket status from cache
   */
  static async getUserStatus(userFid: string): Promise<CachedUserData | null> {
    try {
      const redis = this.getRedis();
      const cached = await redis.get(this.keys.userStatus(userFid));
      
      if (!cached) {
        console.log(`🔍 Cache miss for user ${userFid}`);
        return null;
      }
      
      const userData = cached as CachedUserData;
      console.log(`✅ Cache hit for user ${userFid}: ${userData.currentTickets} tickets`);
      return userData;
    } catch (error) {
      console.error('❌ Cache read error for user status:', error);
      return null;
    }
  }

  /**
   * Cache user's ticket status
   */
  static async cacheUserStatus(
    userFid: string, 
    tickets: number, 
    raffleId: string,
    ttl: number = 3600 // 1 hour default
  ): Promise<void> {
    try {
      const redis = this.getRedis();
      const userData: CachedUserData = {
        fid: userFid,
        currentTickets: tickets,
        raffleId,
        lastUpdated: new Date().toISOString()
      };

      await redis.setex(this.keys.userStatus(userFid), ttl, JSON.stringify(userData));
      console.log(`📝 Cached user ${userFid}: ${tickets} tickets`);
    } catch (error) {
      console.error('❌ Cache write error for user status:', error);
    }
  }

  /**
   * Get active raffle data from cache
   */
  static async getActiveRaffle(): Promise<CachedRaffleData | null> {
    try {
      const redis = this.getRedis();
      const cached = await redis.get(this.keys.activeRaffle());
      
      if (!cached) {
        console.log('🔍 Cache miss for active raffle');
        return null;
      }
      
      const raffleData = cached as CachedRaffleData;
      console.log(`✅ Cache hit for active raffle: ${raffleData.id}`);
      return raffleData;
    } catch (error) {
      console.error('❌ Cache read error for active raffle:', error);
      return null;
    }
  }

  /**
   * Cache active raffle data
   */
  static async cacheActiveRaffle(
    raffleData: Omit<CachedRaffleData, 'lastUpdated'>,
    ttl: number = 1800 // 30 minutes default
  ): Promise<void> {
    try {
      const redis = this.getRedis();
      const cacheData: CachedRaffleData = {
        ...raffleData,
        lastUpdated: new Date().toISOString()
      };

      await redis.setex(this.keys.activeRaffle(), ttl, JSON.stringify(cacheData));
      console.log(`📝 Cached active raffle: ${raffleData.id}`);
    } catch (error) {
      console.error('❌ Cache write error for active raffle:', error);
    }
  }

  /**
   * Get leaderboard from cache
   */
  static async getLeaderboard(raffleId: string, limit: number = 10): Promise<CachedLeaderboard[]> {
    try {
      const redis = this.getRedis();
      const cached = await redis.get(this.keys.leaderboard(raffleId));
      
      if (!cached) {
        console.log(`🔍 Cache miss for leaderboard ${raffleId}`);
        return [];
      }
      
      const leaderboard = cached as CachedLeaderboard[];
      console.log(`✅ Cache hit for leaderboard ${raffleId}: ${leaderboard.length} entries`);
      return leaderboard.slice(0, limit);
    } catch (error) {
      console.error('❌ Cache read error for leaderboard:', error);
      return [];
    }
  }

  /**
   * Cache leaderboard data
   */
  static async cacheLeaderboard(
    raffleId: string,
    leaderboard: CachedLeaderboard[],
    ttl: number = 300 // 5 minutes default
  ): Promise<void> {
    try {
      const redis = this.getRedis();
      await redis.setex(this.keys.leaderboard(raffleId), ttl, JSON.stringify(leaderboard));
      console.log(`📝 Cached leaderboard for ${raffleId}: ${leaderboard.length} entries`);
    } catch (error) {
      console.error('❌ Cache write error for leaderboard:', error);
    }
  }

  /**
   * Invalidate user cache (when tickets change)
   */
  static async invalidateUserCache(userFid: string): Promise<void> {
    try {
      const redis = this.getRedis();
      await redis.del(this.keys.userStatus(userFid));
      console.log(`🗑️ Invalidated cache for user ${userFid}`);
    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
    }
  }

  /**
   * Invalidate raffle cache (when raffle data changes)
   */
  static async invalidateRaffleCache(raffleId?: string): Promise<void> {
    try {
      const redis = this.getRedis();
      await redis.del(this.keys.activeRaffle());
      
      if (raffleId) {
        await redis.del(this.keys.leaderboard(raffleId));
      }
      
      console.log(`🗑️ Invalidated raffle cache ${raffleId ? `for ${raffleId}` : '(all)'}`);
    } catch (error) {
      console.error('❌ Raffle cache invalidation error:', error);
    }
  }

  /**
   * Set sync lock (prevents concurrent background syncs)
   */
  static async setSyncLock(ttl: number = 120): Promise<boolean> {
    try {
      const redis = this.getRedis();
      const result = await redis.set(this.keys.syncLock(), Date.now().toString(), {
        nx: true, // Only set if not exists
        ex: ttl   // Expire after ttl seconds
      });
      
      return result === 'OK';
    } catch (error) {
      console.error('❌ Sync lock error:', error);
      return false;
    }
  }

  /**
   * Release sync lock
   */
  static async releaseSyncLock(): Promise<void> {
    try {
      const redis = this.getRedis();
      await redis.del(this.keys.syncLock());
    } catch (error) {
      console.error('❌ Sync lock release error:', error);
    }
  }

  /**
   * Update last sync timestamp
   */
  static async updateLastSync(): Promise<void> {
    try {
      const redis = this.getRedis();
      await redis.set(this.keys.lastSync(), new Date().toISOString());
    } catch (error) {
      console.error('❌ Last sync update error:', error);
    }
  }

  /**
   * Get last sync timestamp
   */
  static async getLastSync(): Promise<Date | null> {
    try {
      const redis = this.getRedis();
      const lastSync = await redis.get(this.keys.lastSync());
      
      return lastSync ? new Date(lastSync as string) : null;
    } catch (error) {
      console.error('❌ Last sync read error:', error);
      return null;
    }
  }

  /**
   * Health check for Redis connection
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const redis = this.getRedis();
      await redis.ping();
      return true;
    } catch (error) {
      console.error('❌ Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    redisHealthy: boolean;
    lastSync: Date | null;
    syncLockActive: boolean;
  }> {
    try {
      const redis = this.getRedis();
      
      const [healthCheck, lastSync, syncLock] = await Promise.allSettled([
        this.healthCheck(),
        this.getLastSync(),
        redis.get(this.keys.syncLock())
      ]);

      return {
        redisHealthy: healthCheck.status === 'fulfilled' ? healthCheck.value : false,
        lastSync: lastSync.status === 'fulfilled' ? lastSync.value : null,
        syncLockActive: syncLock.status === 'fulfilled' ? !!syncLock.value : false
      };
    } catch (error) {
      console.error('❌ Cache stats error:', error);
      return {
        redisHealthy: false,
        lastSync: null,
        syncLockActive: false
      };
    }
  }
}