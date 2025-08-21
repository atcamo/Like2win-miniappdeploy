import { NextRequest, NextResponse } from 'next/server';
import { BackgroundSyncService } from '@/lib/services/backgroundSync';
import { CacheService } from '@/lib/services/cacheService';

/**
 * Cache System Startup API
 * Initializes the background sync service and performs initial data population
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Cache system startup initiated');

    // Check if background sync is already running
    const syncStatus = BackgroundSyncService.getStatus();
    
    if (syncStatus.isRunning) {
      return NextResponse.json({
        success: true,
        message: 'Background sync already running',
        status: syncStatus,
        alreadyRunning: true
      });
    }

    // Start background sync service
    BackgroundSyncService.start();

    // Perform initial manual sync to populate cache
    console.log('🔄 Performing initial cache population...');
    const initialSync = await BackgroundSyncService.manualSync();

    // Check cache health after startup
    const cacheStats = await CacheService.getCacheStats();

    return NextResponse.json({
      success: true,
      message: 'Cache system started successfully',
      initialSync: {
        success: initialSync.success,
        duration: initialSync.duration,
        error: initialSync.error
      },
      backgroundSync: BackgroundSyncService.getStatus(),
      cacheHealth: cacheStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cache startup error:', error);
    return NextResponse.json(
      { 
        error: 'Cache startup failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for cache startup status
 */
export async function GET(request: NextRequest) {
  try {
    const syncStatus = BackgroundSyncService.getStatus();
    const cacheStats = await CacheService.getCacheStats();

    return NextResponse.json({
      success: true,
      backgroundSync: syncStatus,
      cache: cacheStats,
      recommendations: {
        shouldStart: !syncStatus.isRunning,
        status: syncStatus.isRunning ? 'running' : 'stopped'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cache startup status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get cache status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}