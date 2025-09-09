import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleService } from '@/lib/services/dailyRaffleService';

/**
 * Clean Mock Users from Daily Raffle Service
 * Removes all fake/test users (12345, 67890, etc.) from the daily raffle
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Cleaning mock users from daily raffle service...');

    // Clear all mock users from the daily service
    const removedCount = dailyRaffleService.clearMockUsers();
    
    // Get updated stats
    const stats = dailyRaffleService.getTotalStats();
    const debugInfo = dailyRaffleService.getDebugInfo();
    
    console.log(`✅ Cleaned ${removedCount} mock users from daily raffle`);
    console.log(`📊 New stats: ${stats.totalParticipants} participants, ${stats.totalTickets} tickets`);

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${removedCount} mock users from daily raffle`,
      data: {
        removedCount,
        newStats: stats,
        debugInfo: debugInfo
      }
    });

  } catch (error) {
    console.error('❌ Clean daily raffle error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clean daily raffle',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check current daily raffle status
 */
export async function GET(request: NextRequest) {
  try {
    const stats = dailyRaffleService.getTotalStats();
    const leaderboard = dailyRaffleService.getLeaderboard(10);
    const raffleInfo = dailyRaffleService.getRaffleInfo();
    const debugInfo = dailyRaffleService.getDebugInfo();
    
    return NextResponse.json({
      success: true,
      data: {
        raffleInfo,
        stats,
        leaderboard,
        debugInfo
      }
    });
  } catch (error) {
    console.error('❌ Daily raffle status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get daily raffle status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}