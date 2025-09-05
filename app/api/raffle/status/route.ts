import { NextRequest, NextResponse } from 'next/server';

/**
 * Raffle Status API (Production-ready with Local Data)
 * Returns current raffle status and user participation data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFid = searchParams.get('fid');

    console.log(`🎯 Raffle Status API (Production): ${userFid ? `User ${userFid}` : 'General status'}`);

    // Use local data as primary source (reliable and fast)
    try {
      const { readFileSync, existsSync } = require('fs');
      const { join } = require('path');
      
      const dataPath = join(process.cwd(), 'data');
      const raffleDataFile = join(dataPath, 'local-raffle-data.json');
      const userTicketsFile = join(dataPath, 'local-user-tickets.json');

      if (existsSync(raffleDataFile)) {
        console.log(`✅ Found local raffle data`);
        
        const raffleData = JSON.parse(readFileSync(raffleDataFile, 'utf8'));
        let userData = null;

        // If user requested, get their specific data
        if (userFid && existsSync(userTicketsFile)) {
          const userTickets = JSON.parse(readFileSync(userTicketsFile, 'utf8'));
          const userInfo = userTickets[userFid];
          
          if (userInfo) {
            userData = {
              fid: parseInt(userFid),
              tickets: userInfo.tickets || 0,
              username: userInfo.username,
              displayName: userInfo.username || `User ${userFid}`,
              lastActivity: userInfo.lastActivity,
              isFollowing: userInfo.isFollowing || false,
              engagementCount: userInfo.engagementCount || 0
            };
          }
        }

        // Calculate time remaining
        const now = new Date();
        const endDate = new Date(raffleData.endDate || (() => {
          // Default: today at 23:59:59 UTC
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          if (now > today) {
            today.setDate(today.getDate() + 1);
          }
          return today.toISOString();
        })());

        const timeRemainingMs = Math.max(0, endDate.getTime() - now.getTime());
        const hoursRemaining = Math.floor(timeRemainingMs / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

        return NextResponse.json({
          success: true,
          source: 'production_local_data',
          raffle: {
            id: raffleData.id || 'daily-raffle-' + new Date().toISOString().split('T')[0],
            weekPeriod: raffleData.weekPeriod || 'Daily Raffle - ' + new Date().toISOString().split('T')[0],
            raffleType: 'DAILY',
            status: 'ACTIVE',
            startDate: raffleData.startDate || new Date().toISOString(),
            endDate: endDate.toISOString(),
            prizeAmount: 500, // 500 DEGEN daily
            totalPool: 500,
            totalTickets: raffleData.totalTickets || 0,
            totalParticipants: raffleData.totalParticipants || 0,
            dayNumber: new Date().getDay() || 7,
            timeRemaining: {
              hours: hoursRemaining,
              minutes: minutesRemaining,
              total: timeRemainingMs
            }
          },
          user: userData,
          timestamp: new Date().toISOString()
        });
      }
    } catch (localError) {
      console.log(`⚠️ Local data not available:`, localError);
    }

    // Default response if no data available
    const now = new Date();
    const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const timeRemainingMs = Math.max(0, endToday.getTime() - now.getTime());
    const hoursRemaining = Math.floor(timeRemainingMs / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      success: true,
      source: 'default_generated',
      raffle: {
        id: 'daily-raffle-' + now.toISOString().split('T')[0],
        weekPeriod: 'Daily Raffle - ' + now.toISOString().split('T')[0],
        raffleType: 'DAILY',
        status: 'ACTIVE',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1, 0, 0).toISOString(),
        endDate: endToday.toISOString(),
        prizeAmount: 500,
        totalPool: 500,
        totalTickets: 0,
        totalParticipants: 0,
        dayNumber: now.getDay() || 7,
        timeRemaining: {
          hours: hoursRemaining,
          minutes: minutesRemaining,
          total: timeRemainingMs
        }
      },
      user: userFid ? {
        fid: parseInt(userFid),
        tickets: 0,
        displayName: `User ${userFid}`,
        isFollowing: false,
        engagementCount: 0
      } : null,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('❌ Raffle status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}