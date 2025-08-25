import { NextRequest, NextResponse } from 'next/server';
import { createDegenDistributor } from '@/lib/services/degenDistribution';

/**
 * Close current raffle, execute winner selection, and distribute DEGEN automatically
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Closing current raffle and selecting winner...');

    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      await pool.query('BEGIN');

      // 1. Get current active raffle
      const activeRaffleResult = await pool.query(`
        SELECT id, "weekPeriod", "totalTickets", "totalParticipants", "prizePool"
        FROM raffles 
        WHERE status = 'ACTIVE'
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);

      if (activeRaffleResult.rows.length === 0) {
        return NextResponse.json({
          error: 'No active raffle found'
        }, { status: 400 });
      }

      const raffle = activeRaffleResult.rows[0];
      console.log(`🎯 Found active raffle: ${raffle.weekPeriod} with ${raffle.totalParticipants} participants`);

      // 2. Get all participants and their tickets
      const participantsResult = await pool.query(`
        SELECT ut."userFid", ut."ticketsCount"
        FROM user_tickets ut
        WHERE ut."raffleId" = $1
        ORDER BY ut."ticketsCount" DESC
      `, [raffle.id]);

      const participants = participantsResult.rows;
      console.log(`👥 Found ${participants.length} participants`);

      // 3. Select winner using weighted random selection
      const totalTickets = participants.reduce((sum, p) => sum + p.ticketsCount, 0);
      const randomNumber = Math.floor(Math.random() * totalTickets) + 1;
      
      let runningTotal = 0;
      let winner = null;

      for (const participant of participants) {
        runningTotal += participant.ticketsCount;
        if (randomNumber <= runningTotal) {
          winner = participant;
          break;
        }
      }

      if (!winner) {
        winner = participants[0]; // Fallback to first participant
      }

      console.log(`🏆 Winner selected: FID ${winner.userFid} with ${winner.ticketsCount} tickets`);

      // 4. Update raffle status to COMPLETED and set winner
      const updateRaffleResult = await pool.query(`
        UPDATE raffles 
        SET status = 'COMPLETED',
            "winnerFid" = $1,
            "winnerTickets" = $2,
            "completedAt" = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [winner.userFid, winner.ticketsCount, raffle.id]);

      // 5. Update winner in users table (add winnings)
      const updateWinnerResult = await pool.query(`
        UPDATE users 
        SET "totalWinnings" = COALESCE("totalWinnings", 0) + $1,
            "lastWinAt" = CURRENT_TIMESTAMP
        WHERE fid = $2
      `, [raffle.prizePool, winner.userFid.toString()]);

      // 6. Create winner record (if table exists)
      try {
        await pool.query(`
          INSERT INTO raffle_winners ("raffleId", "winnerFid", "winnerTickets", "prizeAmount", "createdAt")
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        `, [raffle.id, winner.userFid, winner.ticketsCount, raffle.prizePool]);
      } catch (error) {
        console.log('Note: raffle_winners table may not exist yet');
      }

      await pool.query('COMMIT');

      console.log('✅ Raffle closed successfully');

      // 7. Distribute DEGEN to winner automatically
      console.log('💰 Starting automatic DEGEN distribution...');
      
      const distributor = createDegenDistributor();
      let distributionResult = null;
      
      if (distributor) {
        try {
          distributionResult = await distributor.distributeToWinner(
            winner.userFid.toString(),
            1000 // 1000 DEGEN prize
          );
          
          console.log('🎉 Distribution result:', distributionResult);
          
          // Update the database with distribution status
          if (distributionResult.success) {
            await pool.query(`
              UPDATE raffles 
              SET "distributionStatus" = 'COMPLETED',
                  "transactionHash" = $1
              WHERE id = $2
            `, [distributionResult.transactionHash, raffle.id]);
            
            console.log('✅ Prize distributed successfully!');
          } else {
            await pool.query(`
              UPDATE raffles 
              SET "distributionStatus" = 'FAILED',
                  "distributionError" = $1
              WHERE id = $2
            `, [distributionResult.error || distributionResult.message, raffle.id]);
            
            console.log('❌ Prize distribution failed');
          }
        } catch (error) {
          console.error('❌ Distribution error:', error);
          distributionResult = {
            success: false,
            message: 'Distribution service error',
            error: error instanceof Error ? error.message : String(error)
          };
        }
      } else {
        distributionResult = {
          success: false,
          message: 'DEGEN distributor not available',
          error: 'Missing configuration'
        };
      }

      return NextResponse.json({
        success: true,
        message: 'Raffle closed and winner selected',
        raffle: {
          id: raffle.id,
          weekPeriod: raffle.weekPeriod,
          totalParticipants: raffle.totalParticipants,
          totalTickets: raffle.totalTickets,
          prizePool: raffle.prizePool
        },
        winner: {
          fid: winner.userFid,
          tickets: winner.ticketsCount,
          probability: (winner.ticketsCount / totalTickets * 100).toFixed(2) + '%',
          prizeAmount: raffle.prizePool
        },
        selectionDetails: {
          totalTickets,
          randomNumber,
          winningTicketRange: `${runningTotal - winner.ticketsCount + 1}-${runningTotal}`
        },
        distribution: distributionResult
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error closing raffle:', error);
    return NextResponse.json(
      { 
        error: 'Failed to close raffle',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}