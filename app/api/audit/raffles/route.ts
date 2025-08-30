import { NextRequest, NextResponse } from 'next/server';

/**
 * Public API for raffle audit data - Shows historical winners and raffle information
 */
export async function GET() {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    // Get all completed raffles with winner information
    const completedRafflesResult = await pool.query(`
      SELECT 
        id,
        "weekPeriod",
        "startDate",
        "endDate", 
        "totalTickets",
        "totalParticipants",
        "firstPlaceFid",
        "firstPrize",
        "executedAt",
        "winningTicketNumber",
        "selectionAlgorithm",
        "auditData",
        "createdAt"
      FROM raffles 
      WHERE status = 'COMPLETED'
      ORDER BY "executedAt" DESC, "createdAt" DESC
    `);

    // Get winner details from Neynar for each completed raffle
    const rafflesWithWinnerInfo = [];
    
    for (const raffle of completedRafflesResult.rows) {
      let winnerInfo = null;
      
      if (raffle.firstPlaceFid && process.env.NEYNAR_API_KEY) {
        try {
          const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${raffle.firstPlaceFid}`, {
            headers: {
              'accept': 'application/json',
              'api_key': process.env.NEYNAR_API_KEY
            }
          });

          if (response.ok) {
            const userData = await response.json();
            const user = userData.users?.[0];
            
            if (user) {
              winnerInfo = {
                fid: raffle.firstPlaceFid,
                username: user.username,
                displayName: user.display_name,
                pfpUrl: user.pfp_url,
                verifiedAddresses: user.verified_addresses?.eth_addresses || [],
                custodyAddress: user.custody_address,
                followerCount: user.follower_count,
                followingCount: user.following_count
              };
            }
          }
        } catch (error) {
          console.log(`Failed to get winner info for FID ${raffle.firstPlaceFid}:`, error);
        }
      }

      // Parse audit data
      let parsedAuditData = null;
      try {
        parsedAuditData = raffle.auditData ? JSON.parse(raffle.auditData) : null;
      } catch (error) {
        console.log('Failed to parse audit data:', error);
      }

      rafflesWithWinnerInfo.push({
        raffle: {
          id: raffle.id,
          weekPeriod: raffle.weekPeriod,
          startDate: raffle.startDate,
          endDate: raffle.endDate,
          totalTickets: raffle.totalTickets,
          totalParticipants: raffle.totalParticipants,
          prizeAmount: raffle.firstPrize,
          executedAt: raffle.executedAt,
          createdAt: raffle.createdAt,
          winningTicketNumber: raffle.winningTicketNumber,
          selectionAlgorithm: raffle.selectionAlgorithm
        },
        winner: winnerInfo,
        auditTrail: parsedAuditData
      });
    }

    // Get current active raffle info for context
    const activeRaffleResult = await pool.query(`
      SELECT 
        id,
        "weekPeriod",
        "startDate",
        "endDate",
        "totalTickets",
        "totalParticipants"
      FROM raffles 
      WHERE status = 'ACTIVE'
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);

    await pool.end();

    // Generate summary statistics
    const totalRaffles = rafflesWithWinnerInfo.length;
    const totalPrizesDistributed = rafflesWithWinnerInfo.reduce((sum, r) => sum + (r.raffle.prizeAmount || 0), 0);
    const totalTicketsAllTime = rafflesWithWinnerInfo.reduce((sum, r) => sum + (r.raffle.totalTickets || 0), 0);
    const totalParticipantsAllTime = rafflesWithWinnerInfo.reduce((sum, r) => sum + (r.raffle.totalParticipants || 0), 0);

    return NextResponse.json({
      success: true,
      auditInfo: {
        generatedAt: new Date().toISOString(),
        dataSource: 'like2win_postgresql_database',
        verificationMethod: 'blockchain_transaction_hashes',
        algorithm: 'weighted_random_by_engagement_tickets'
      },
      summary: {
        totalCompletedRaffles: totalRaffles,
        totalPrizesDistributed: `${totalPrizesDistributed} DEGEN`,
        totalTicketsAllTime: totalTicketsAllTime,
        totalParticipantsAllTime: totalParticipantsAllTime,
        averageTicketsPerRaffle: totalRaffles > 0 ? Math.round(totalTicketsAllTime / totalRaffles) : 0,
        averageParticipantsPerRaffle: totalRaffles > 0 ? Math.round(totalParticipantsAllTime / totalRaffles) : 0
      },
      currentActiveRaffle: activeRaffleResult.rows[0] || null,
      historicalRaffles: rafflesWithWinnerInfo,
      disclaimer: "All raffle data is stored on-chain and verifiable via blockchain transactions. Winners are selected using provably random algorithms based on engagement tickets earned through verified Farcaster interactions."
    });

  } catch (error) {
    console.error('❌ Error fetching audit data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch audit data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}