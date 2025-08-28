import { NextRequest, NextResponse } from 'next/server';
import { engagementService } from '@/lib/services/engagement-service';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Load historical likes and save to local JSON file (without database)
 * This creates a local data store for testing the ranking system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, forceRefresh = false } = body;

    const historyStartDate = startDate ? new Date(startDate) : new Date('2025-08-18T00:00:00.000Z');
    const historyEndDate = endDate ? new Date(endDate) : new Date();

    console.log('🔍 Loading historical likes locally:', {
      startDate: historyStartDate.toISOString(),
      endDate: historyEndDate.toISOString(),
      forceRefresh
    });

    // Path for local data storage
    const dataPath = join(process.cwd(), 'data');
    const raffleDataFile = join(dataPath, 'local-raffle-data.json');
    const userTicketsFile = join(dataPath, 'local-user-tickets.json');

    // Ensure data directory exists
    try {
      if (!existsSync(dataPath)) {
        require('fs').mkdirSync(dataPath, { recursive: true });
      }
    } catch (err) {
      console.log('Note: Could not create data directory, using memory storage');
    }

    // Check if we have cached data and don't need to refresh
    let existingData = null;
    if (!forceRefresh && existsSync(userTicketsFile)) {
      try {
        const fileContent = readFileSync(userTicketsFile, 'utf8');
        existingData = JSON.parse(fileContent);
        console.log(`📋 Found existing local data with ${Object.keys(existingData).length} users`);
      } catch (err) {
        console.log('Could not read existing data, will fetch fresh');
      }
    }

    if (existingData && !forceRefresh) {
      // Return existing data
      const totalTickets = Object.values(existingData).reduce((sum: number, tickets: any) => sum + tickets.tickets, 0);
      const totalUsers = Object.keys(existingData).length;
      
      return NextResponse.json({
        success: true,
        cached: true,
        summary: {
          totalUsers,
          totalTickets,
          message: 'Using cached local data',
          period: {
            start: historyStartDate.toISOString(),
            end: historyEndDate.toISOString()
          }
        },
        leaderboard: Object.entries(existingData)
          .map(([fid, data]: [string, any]) => ({
            userFid: fid,
            tickets: data.tickets,
            username: data.username || `user_${fid}`,
            lastActivity: data.lastActivity
          }))
          .sort((a, b) => b.tickets - a.tickets)
          .slice(0, 10),
        note: 'This is local cached data. Use forceRefresh=true to reload from Farcaster.'
      });
    }

    // Check if engagement service is available
    if (!engagementService.isInitialized()) {
      return NextResponse.json({
        error: 'Engagement service not available - cannot fetch real historical data',
        note: 'Make sure NEYNAR_API_KEY is properly configured'
      }, { status: 503 });
    }

    console.log('🔍 Fetching real Like2Win casts...');
    const like2winCasts = await engagementService.getLike2WinCasts(20); // Get more casts for historical data
    console.log(`📋 Found ${like2winCasts.length} Like2Win casts`);

    if (like2winCasts.length === 0) {
      return NextResponse.json({
        error: 'No Like2Win casts found',
        like2winFid: engagementService.getLike2WinFid()
      }, { status: 404 });
    }

    let userTickets: Record<string, { tickets: number; username: string; lastActivity: string; casts: string[] }> = {};
    let totalProcessed = 0;
    let castsProcessed = 0;

    // Process each cast and get real reactions
    for (const cast of like2winCasts) {
      try {
        const castDate = new Date(cast.timestamp);
        
        // Skip if cast is outside our historical period
        if (castDate < historyStartDate || castDate > historyEndDate) {
          continue;
        }
        
        console.log(`📅 Processing cast ${cast.hash} from ${castDate.toISOString()}`);
        castsProcessed++;
        
        // Get real reactions for this cast
        const reactions = await engagementService.getCastReactions(cast.hash, 'likes');
        
        if (reactions && reactions.length > 0) {
          console.log(`   👍 Found ${reactions.length} real likes on this cast`);
          
          // Process each like
          for (const reaction of reactions) {
            const userFid = reaction.user?.fid?.toString() || reaction.fid?.toString();
            const username = reaction.user?.username || reaction.username || `user_${userFid}`;
            
            if (userFid) {
              if (!userTickets[userFid]) {
                userTickets[userFid] = {
                  tickets: 0,
                  username,
                  lastActivity: reaction.timestamp || cast.timestamp,
                  casts: []
                };
              }
              
              // Award 1 ticket per like, avoid duplicates per cast
              if (!userTickets[userFid].casts.includes(cast.hash)) {
                userTickets[userFid].tickets += 1;
                userTickets[userFid].casts.push(cast.hash);
                userTickets[userFid].lastActivity = reaction.timestamp || cast.timestamp;
                totalProcessed++;
              }
            }
          }
        } else {
          console.log(`   ⚠️ No likes found for cast ${cast.hash}`);
        }
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`❌ Error processing cast ${cast.hash}:`, error);
        continue;
      }
    }

    // Save data locally
    const raffleData = {
      id: 'local-raffle-2025',
      weekPeriod: 'Week 34-37 2025 (Launch Raffle)',
      startDate: historyStartDate.toISOString(),
      endDate: '2025-09-15T23:59:59.000Z',
      totalTickets: Object.values(userTickets).reduce((sum, user) => sum + user.tickets, 0),
      totalParticipants: Object.keys(userTickets).length,
      lastUpdated: new Date().toISOString()
    };

    try {
      writeFileSync(raffleDataFile, JSON.stringify(raffleData, null, 2));
      writeFileSync(userTicketsFile, JSON.stringify(userTickets, null, 2));
      console.log('💾 Saved data locally');
    } catch (err) {
      console.log('Note: Could not save to file, data exists in memory only');
    }

    // Create leaderboard
    const leaderboard = Object.entries(userTickets)
      .map(([fid, data]) => ({
        userFid: fid,
        tickets: data.tickets,
        username: data.username,
        lastActivity: data.lastActivity
      }))
      .sort((a, b) => b.tickets - a.tickets);

    return NextResponse.json({
      success: true,
      summary: {
        castsProcessed,
        totalLikes: totalProcessed,
        totalUsers: Object.keys(userTickets).length,
        totalTickets: raffleData.totalTickets,
        period: {
          start: historyStartDate.toISOString(),
          end: historyEndDate.toISOString()
        },
        activeRaffle: raffleData.weekPeriod,
        like2winFid: engagementService.getLike2WinFid()
      },
      leaderboard: leaderboard.slice(0, 10),
      allUsers: leaderboard.length,
      message: `🎯 Successfully processed ${castsProcessed} Like2Win casts, found ${totalProcessed} real historical likes from ${Object.keys(userTickets).length} users`,
      note: 'Data saved locally. Users will now appear in the ranking!'
    });

  } catch (error) {
    console.error('❌ Error loading historical likes locally:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load historical likes',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}