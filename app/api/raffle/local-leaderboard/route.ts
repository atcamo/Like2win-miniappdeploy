import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Get leaderboard from local JSON data (fallback when database is not available)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Path for local data storage
    const dataPath = join(process.cwd(), 'data');
    const raffleDataFile = join(dataPath, 'local-raffle-data.json');
    const userTicketsFile = join(dataPath, 'local-user-tickets.json');

    if (!existsSync(userTicketsFile) || !existsSync(raffleDataFile)) {
      return NextResponse.json({
        error: 'No local data found',
        message: 'Run the historical likes loader first: /api/admin/load-historical-local',
        leaderboard: [],
        total: 0
      });
    }

    // Read local data
    const raffleData = JSON.parse(readFileSync(raffleDataFile, 'utf8'));
    const userTickets = JSON.parse(readFileSync(userTicketsFile, 'utf8'));

    // Create leaderboard
    const leaderboard = Object.entries(userTickets)
      .map(([fid, data]: [string, any]) => ({
        userFid: parseInt(fid),
        tickets: data.tickets,
        username: data.username || `user_${fid}`,
        displayName: data.username || `User ${fid}`,
        lastActivity: data.lastActivity,
        castsLiked: data.casts?.length || 0
      }))
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, limit);

    // Calculate position for each user
    const leaderboardWithPositions = leaderboard.map((user, index) => ({
      ...user,
      position: index + 1
    }));

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: leaderboardWithPositions,
        raffle: {
          id: raffleData.id,
          weekPeriod: raffleData.weekPeriod,
          totalTickets: raffleData.totalTickets,
          totalParticipants: raffleData.totalParticipants,
          endDate: raffleData.endDate || '2025-09-15T23:59:59.000Z',
          lastUpdated: raffleData.lastUpdated
        },
        total: Object.keys(userTickets).length,
        showing: leaderboardWithPositions.length
      },
      message: `Showing top ${leaderboardWithPositions.length} participants from local data`,
      note: 'This data is loaded from local storage. Database connection not required.'
    });

  } catch (error) {
    console.error('❌ Error loading local leaderboard:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load local leaderboard',
        details: error instanceof Error ? error.message : String(error),
        leaderboard: [],
        total: 0
      },
      { status: 500 }
    );
  }
}