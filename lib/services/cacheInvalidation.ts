/**
 * Like2Win Cache Invalidation Service
 * Handles intelligent cache invalidation based on data changes
 */

import { CacheService } from './cacheService';
import { BackgroundSyncService } from './backgroundSync';

interface InvalidationContext {
  userFid?: string;
  raffleId?: string;
  reason: string;
  timestamp?: Date;
}

export class CacheInvalidationService {
  
  /**
   * Invalidate user-specific cache when their tickets change
   */
  static async invalidateUserData(userFid: string, context: InvalidationContext = { reason: 'user_data_change' }): Promise<void> {
    try {
      console.log(`🗑️ Invalidating cache for user ${userFid}: ${context.reason}`);
      
      // Invalidate user cache
      await CacheService.invalidateUserCache(userFid);
      
      // Force sync this user's fresh data
      const syncSuccess = await BackgroundSyncService.syncUserData(userFid);
      
      if (syncSuccess) {
        console.log(`✅ User ${userFid} cache invalidated and resynced`);
      } else {
        console.log(`⚠️ User ${userFid} cache invalidated but resync failed`);
      }
    } catch (error) {
      console.error(`❌ Failed to invalidate user ${userFid} cache:`, error);
    }
  }

  /**
   * Invalidate raffle-wide cache when raffle data changes
   */
  static async invalidateRaffleData(raffleId: string, context: InvalidationContext = { reason: 'raffle_data_change' }): Promise<void> {
    try {
      console.log(`🗑️ Invalidating raffle cache for ${raffleId}: ${context.reason}`);
      
      // Invalidate raffle and leaderboard cache
      await CacheService.invalidateRaffleCache(raffleId);
      
      // Trigger background sync to refresh all raffle data
      BackgroundSyncService.manualSync().catch(error => {
        console.error('Background sync failed after raffle invalidation:', error);
      });
      
      console.log(`✅ Raffle ${raffleId} cache invalidated`);
    } catch (error) {
      console.error(`❌ Failed to invalidate raffle ${raffleId} cache:`, error);
    }
  }

  /**
   * Handle engagement event - invalidate relevant caches
   */
  static async onEngagementProcessed(
    userFid: string, 
    raffleId: string, 
    ticketsAwarded: number
  ): Promise<void> {
    try {
      console.log(`🎫 Processing engagement cache updates: user ${userFid}, +${ticketsAwarded} tickets`);
      
      // 1. Invalidate user cache immediately
      await this.invalidateUserData(userFid, { 
        reason: `engagement_processed_+${ticketsAwarded}_tickets`,
        raffleId 
      });
      
      // 2. If significant ticket change, invalidate leaderboard too
      if (ticketsAwarded > 0) {
        await this.invalidateRaffleData(raffleId, { 
          reason: 'user_tickets_changed',
          userFid 
        });
      }
      
      console.log(`✅ Engagement cache updates completed for user ${userFid}`);
    } catch (error) {
      console.error(`❌ Failed to process engagement cache updates:`, error);
    }
  }

  /**
   * Handle new raffle creation - invalidate all relevant caches
   */
  static async onNewRaffleCreated(raffleId: string): Promise<void> {
    try {
      console.log(`🎉 New raffle created: ${raffleId}, invalidating all caches`);
      
      // Invalidate all raffle-related caches
      await CacheService.invalidateRaffleCache();
      
      // Trigger full background sync
      await BackgroundSyncService.manualSync();
      
      console.log(`✅ All caches invalidated for new raffle ${raffleId}`);
    } catch (error) {
      console.error(`❌ Failed to handle new raffle cache invalidation:`, error);
    }
  }

  /**
   * Handle raffle end - clean up caches
   */
  static async onRaffleEnded(raffleId: string): Promise<void> {
    try {
      console.log(`🏁 Raffle ended: ${raffleId}, cleaning up caches`);
      
      // Invalidate old raffle cache
      await CacheService.invalidateRaffleCache(raffleId);
      
      console.log(`✅ Raffle ${raffleId} caches cleaned up`);
    } catch (error) {
      console.error(`❌ Failed to clean up raffle ${raffleId} caches:`, error);
    }
  }

  /**
   * Smart invalidation based on data change type
   */
  static async smartInvalidate(changeType: string, data: any): Promise<void> {
    try {
      switch (changeType) {
        case 'user_tickets_awarded':
          if (data.userFid && data.raffleId && data.ticketsAwarded) {
            await this.onEngagementProcessed(
              data.userFid, 
              data.raffleId, 
              data.ticketsAwarded
            );
          }
          break;

        case 'raffle_totals_updated':
          if (data.raffleId) {
            await this.invalidateRaffleData(data.raffleId, { 
              reason: 'raffle_totals_updated' 
            });
          }
          break;

        case 'user_data_changed':
          if (data.userFid) {
            await this.invalidateUserData(data.userFid, { 
              reason: 'user_data_changed' 
            });
          }
          break;

        case 'new_raffle_created':
          if (data.raffleId) {
            await this.onNewRaffleCreated(data.raffleId);
          }
          break;

        case 'raffle_ended':
          if (data.raffleId) {
            await this.onRaffleEnded(data.raffleId);
          }
          break;

        default:
          console.log(`⚠️ Unknown change type for smart invalidation: ${changeType}`);
      }
    } catch (error) {
      console.error(`❌ Smart invalidation failed for ${changeType}:`, error);
    }
  }

  /**
   * Batch invalidation for multiple users (useful for bulk operations)
   */
  static async batchInvalidateUsers(userFids: string[], context: InvalidationContext): Promise<void> {
    try {
      console.log(`🔄 Batch invalidating ${userFids.length} users: ${context.reason}`);
      
      const invalidationPromises = userFids.map(userFid => 
        this.invalidateUserData(userFid, context)
      );
      
      await Promise.allSettled(invalidationPromises);
      
      console.log(`✅ Batch invalidation completed for ${userFids.length} users`);
    } catch (error) {
      console.error('❌ Batch invalidation failed:', error);
    }
  }

  /**
   * Emergency cache clear - nuclear option
   */
  static async emergencyCacheClear(reason: string): Promise<void> {
    try {
      console.log(`🚨 EMERGENCY CACHE CLEAR: ${reason}`);
      
      // This would require implementing a full cache clear in CacheService
      // For now, we'll invalidate known cache patterns
      await CacheService.invalidateRaffleCache();
      
      // Trigger immediate full resync
      await BackgroundSyncService.manualSync();
      
      console.log('✅ Emergency cache clear completed');
    } catch (error) {
      console.error('❌ Emergency cache clear failed:', error);
    }
  }

  /**
   * Get invalidation statistics
   */
  static async getInvalidationStats(): Promise<{
    cacheHealth: any;
    lastSync: Date | null;
    recommendations: string[];
  }> {
    try {
      const cacheStats = await CacheService.getCacheStats();
      const syncStatus = BackgroundSyncService.getStatus();
      
      const recommendations: string[] = [];
      
      if (!cacheStats.redisHealthy) {
        recommendations.push('Redis connection unhealthy - check configuration');
      }
      
      if (!syncStatus.isRunning) {
        recommendations.push('Background sync not running - start it for fresh data');
      }
      
      if (cacheStats.syncLockActive) {
        recommendations.push('Sync lock active for extended period - may need manual intervention');
      }
      
      return {
        cacheHealth: cacheStats,
        lastSync: cacheStats.lastSync,
        recommendations
      };
    } catch (error) {
      console.error('❌ Failed to get invalidation stats:', error);
      return {
        cacheHealth: null,
        lastSync: null,
        recommendations: ['Failed to get cache statistics']
      };
    }
  }
}