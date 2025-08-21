import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/services/cacheService';
import { BackgroundSyncService } from '@/lib/services/backgroundSync';

/**
 * Cache Health Check API
 * Provides status information about the caching system
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Cache health check requested');

    // Get cache statistics
    const cacheStats = await CacheService.getCacheStats();
    
    // Get background sync status
    const syncStatus = BackgroundSyncService.getStatus();

    // Test cache read/write operations
    const testKey = 'health-check-test';
    const testValue = { timestamp: Date.now(), test: true };
    
    let cacheOperationsWorking = false;
    try {
      // Test Redis operations
      await CacheService.cacheUserStatus('test-user', 0, 'test-raffle', 10); // 10 second TTL
      const testRead = await CacheService.getUserStatus('test-user');
      cacheOperationsWorking = testRead !== null;
    } catch (error) {
      console.error('Cache operations test failed:', error);
      cacheOperationsWorking = false;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cache: {
        redis: {
          healthy: cacheStats.redisHealthy,
          operationsWorking: cacheOperationsWorking
        },
        sync: {
          isRunning: syncStatus.isRunning,
          intervalMs: syncStatus.intervalMs,
          lastSync: cacheStats.lastSync,
          lockActive: cacheStats.syncLockActive
        }
      },
      status: cacheStats.redisHealthy && cacheOperationsWorking ? 'healthy' : 'degraded',
      environment: {
        redisUrl: process.env.REDIS_URL ? 'configured' : 'missing',
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      }
    });

  } catch (error) {
    console.error('❌ Cache health check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Health check failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        status: 'unhealthy'
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to manually trigger background sync
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'start-sync':
        BackgroundSyncService.start();
        return NextResponse.json({
          success: true,
          message: 'Background sync started',
          status: BackgroundSyncService.getStatus()
        });

      case 'stop-sync':
        BackgroundSyncService.stop();
        return NextResponse.json({
          success: true,
          message: 'Background sync stopped',
          status: BackgroundSyncService.getStatus()
        });

      case 'manual-sync':
        console.log('🔄 Manual sync triggered via health API');
        const syncResult = await BackgroundSyncService.manualSync();
        return NextResponse.json({
          success: syncResult.success,
          message: syncResult.success ? 'Manual sync completed' : 'Manual sync failed',
          duration: syncResult.duration,
          error: syncResult.error
        });

      case 'cache-stats':
        const stats = await CacheService.getCacheStats();
        return NextResponse.json({
          success: true,
          stats
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: start-sync, stop-sync, manual-sync, cache-stats' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Cache health action error:', error);
    return NextResponse.json(
      { 
        error: 'Action failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}