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
        SELECT id, "weekPeriod", "totalTickets", "totalParticipants", "totalPool"
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
      const totalTickets = participants.reduce((sum: number, p: any) => sum + p.ticketsCount, 0);
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

      // Set fixed prize amount
      const prizeAmount = 1000; // Fixed 1000 DEGEN prize

      // 4. Update raffle status to COMPLETED and set winner with audit info
      const updateRaffleResult = await pool.query(`
        UPDATE raffles 
        SET status = 'COMPLETED',
            "firstPlaceFid" = $1,
            "firstPrize" = $2,
            "executedAt" = CURRENT_TIMESTAMP,
            "winningTicketNumber" = $4,
            "selectionAlgorithm" = $5,
            "auditData" = $6
        WHERE id = $3
      `, [
        winner.userFid, 
        prizeAmount, 
        raffle.id, 
        randomNumber,
        'weighted_random_by_tickets',
        JSON.stringify({
          totalTickets,
          totalParticipants: participants.length,
          randomNumber,
          winnerTicketRange: `${runningTotal - winner.ticketsCount + 1}-${runningTotal}`,
          allParticipants: participants.map(p => ({
            fid: p.userFid,
            tickets: p.ticketsCount,
            probability: (p.ticketsCount / totalTickets * 100).toFixed(2) + '%'
          })),
          selectionTimestamp: new Date().toISOString(),
          executionMethod: 'automatic_close_raffle_api'
        })
      ]);

      // 5. Update winner in users table (add winnings) - Skip as totalWinnings field may not exist
      console.log(`💰 Winner FID ${winner.userFid} should receive ${prizeAmount} DEGEN`);

      // 6. Create winner record (if table exists) - Skip for now as table structure is unknown
      console.log('🏆 Winner data stored in raffles table as firstPlaceFid');

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
            prizeAmount // Use the same prize amount
          );
          
          console.log('🎉 Distribution result:', distributionResult);
          
          // Send notification
          if (distributionResult.success) {
            console.log('✅ Prize distributed successfully!');
            console.log(`💰 Transaction hash: ${distributionResult.transactionHash}`);
            
            // Notify winner
            try {
              await fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/notify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'raffle_winner',
                  data: {
                    winnerFid: winner.userFid,
                    tickets: winner.ticketsCount,
                    prizeAmount: prizeAmount,
                    transactionHash: distributionResult.transactionHash,
                    raffleId: raffle.id,
                    weekPeriod: raffle.weekPeriod
                  }
                })
              });
            } catch (notifyError) {
              console.log('⚠️ Notification failed:', notifyError);
            }
          } else {
            console.log('❌ Prize distribution failed');
            console.log(`Error: ${distributionResult.error || distributionResult.message}`);
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
          prizePool: prizeAmount
        },
        winner: {
          fid: winner.userFid,
          tickets: winner.ticketsCount,
          probability: (winner.ticketsCount / totalTickets * 100).toFixed(2) + '%',
          prizeAmount: prizeAmount
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