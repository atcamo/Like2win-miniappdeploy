import { NextRequest, NextResponse } from 'next/server';

/**
 * Raffle Leaderboard API (Production-ready with Local Data)
 * Returns current raffle leaderboard with top participants
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`🏆 Raffle Leaderboard API (Production) (limit: ${limit})`);

    // Use local data as primary source
    try {
      const { readFileSync, existsSync } = require('fs');
      const { join } = require('path');
      
      const dataPath = join(process.cwd(), 'data');
      const userTicketsFile = join(dataPath, 'local-user-tickets.json');
      const raffleDataFile = join(dataPath, 'local-raffle-data.json');

      if (existsSync(userTicketsFile) && existsSync(raffleDataFile)) {
        console.log(`✅ Found local data files`);
        
        const userTickets = JSON.parse(readFileSync(userTicketsFile, 'utf8'));
        const raffleData = JSON.parse(readFileSync(raffleDataFile, 'utf8'));
        
        // Build and sort leaderboard
        const leaderboard = Object.entries(userTickets)
          .map(([fid, data]: [string, any]) => ({
            fid: parseInt(fid),
            username: data.username || null,
            displayName: data.username || `User ${fid}`,
            tickets: data.tickets || 0,
            lastActivity: data.lastActivity || null,
            isFollowing: data.isFollowing || false,
            engagementCount: data.engagementCount || 0
          }))
          .filter(entry => entry.tickets > 0) // Only show users with tickets
          .sort((a, b) => b.tickets - a.tickets) // Sort by tickets desc
          .slice(0, limit) // Limit results
          .map((entry, index) => ({ 
            ...entry, 
            rank: index + 1 
          })); // Add rank
        
        console.log(`🏆 Generated leaderboard with ${leaderboard.length} entries`);

        return NextResponse.json({
          success: true,
          source: 'production_local_data',
          leaderboard,
          raffle: {
            id: raffleData.id || 'daily-raffle-' + new Date().toISOString().split('T')[0],
            weekPeriod: raffleData.weekPeriod || 'Daily Raffle - ' + new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
            raffleType: 'DAILY',
            totalTickets: raffleData.totalTickets || 0,
            totalParticipants: raffleData.totalParticipants || 0,
            prizeAmount: 500, // 500 DEGEN daily
            dayNumber: new Date().getDay() || 7
          },
          pagination: {
            limit,
            total: Object.keys(userTickets).length,
            hasMore: Object.keys(userTickets).length > limit
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (localError) {
      console.log(`⚠️ Local data not available:`, localError);
    }

    // Default empty leaderboard response
    const now = new Date();
    return NextResponse.json({
      success: true,
      source: 'default_empty',
      leaderboard: [],
      raffle: {
        id: 'daily-raffle-' + now.toISOString().split('T')[0],
        weekPeriod: 'Daily Raffle - ' + now.toISOString().split('T')[0],
        status: 'ACTIVE',
        raffleType: 'DAILY',
        totalTickets: 0,
        totalParticipants: 0,
        prizeAmount: 500,
        dayNumber: now.getDay() || 7
      },
      pagination: {
        limit,
        total: 0,
        hasMore: false
      },
      message: 'No participants yet - be the first to participate!',
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('❌ Leaderboard error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}