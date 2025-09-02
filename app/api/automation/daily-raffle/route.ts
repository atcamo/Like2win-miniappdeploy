import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Daily Raffle Automation API
 * 
 * This endpoint should be called:
 * - At 23:59 UTC daily to execute the current raffle
 * - At 00:01 UTC daily to start the next raffle
 * 
 * Can be triggered by:
 * - GitHub Actions cron job
 * - Vercel cron job
 * - External cron service (cron-job.org)
 * - Smart contract automation
 */
export async function POST(request: NextRequest) {
  try {
    const { action, authorization } = await request.json();

    // Verify authorization (use a secret key)
    if (authorization !== process.env.AUTOMATION_SECRET) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    console.log(`🤖 Daily Raffle Automation: ${action}`);

    switch (action) {
      case 'execute_daily_raffle':
        try {
          const result = await executeDailyRaffleInternal();
          return NextResponse.json(result);
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Execute daily raffle failed',
            details: error instanceof Error ? error.message : String(error)
          }, { status: 500 });
        }
      
      case 'start_next_raffle':
        try {
          const result = await startNextDailyRaffleInternal();
          return NextResponse.json(result);
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Start next raffle failed',
            details: error instanceof Error ? error.message : String(error)
          }, { status: 500 });
        }
        
      case 'full_daily_cycle':
        // Execute current raffle and start next one
        try {
          const executeResult = await executeDailyRaffleInternal();
          if (executeResult.success) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
            const startResult = await startNextDailyRaffleInternal();
            return NextResponse.json({
              success: true,
              executeResult,
              startResult
            });
          }
          return NextResponse.json(executeResult);
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Full daily cycle failed',
            details: error instanceof Error ? error.message : String(error)
          }, { status: 500 });
        }
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Daily raffle automation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Automation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

async function executeDailyRaffleInternal() {
  console.log('⏰ Executing daily raffle at 23:59...');
  
  try {
    // Get current active daily raffle
    const activeRaffle = await prisma.raffle.findFirst({
      where: {
        status: 'ACTIVE',
        raffleType: 'DAILY'
      },
      include: {
        userTickets: {
          include: {
            user: true
          }
        }
      }
    });

    if (!activeRaffle) {
      return {
        success: false,
        error: 'No active daily raffle found'
      };
    }

    // Check if raffle should end (24 hours have passed)
    const now = new Date();
    const raffleEndTime = new Date(activeRaffle.endDate);
    
    if (now < raffleEndTime) {
      return {
        success: false,
        error: 'Daily raffle not ready to end yet',
        timeRemaining: raffleEndTime.getTime() - now.getTime()
      };
    }

    // Execute raffle selection
    const totalTickets = activeRaffle.userTickets.reduce((sum: number, ut: any) => sum + ut.tickets, 0);
    
    if (totalTickets === 0) {
      // No participants, mark as completed without winner
      await prisma.raffle.update({
        where: { id: activeRaffle.id },
        data: {
          status: 'COMPLETED',
          executedAt: now,
          totalTickets,
          totalParticipants: 0
        }
      });

      return {
        success: true,
        message: 'Daily raffle completed with no participants',
        raffleId: activeRaffle.id
      };
    }

    // Weighted random selection
    const randomTicket = Math.floor(Math.random() * totalTickets) + 1;
    let ticketCounter = 0;
    let winner = null;

    for (const userTicket of activeRaffle.userTickets) {
      ticketCounter += userTicket.tickets;
      if (randomTicket <= ticketCounter) {
        winner = userTicket;
        break;
      }
    }

    if (!winner) {
      throw new Error('Winner selection failed');
    }

    // Update raffle with results
    const completedRaffle = await prisma.raffle.update({
      where: { id: activeRaffle.id },
      data: {
        status: 'COMPLETED',
        executedAt: now,
        firstPlaceFid: winner.user.fid,
        firstPrize: 500, // 500 DEGEN daily prize
        totalTickets,
        totalParticipants: activeRaffle.userTickets.length,
        winningTicketNumber: randomTicket,
        selectionAlgorithm: 'weighted_random_by_tickets'
      }
    });

    // TODO: Transfer DEGEN tokens to winner
    console.log(`🏆 Daily raffle winner: FID ${winner.user.fid} with ${winner.tickets} tickets`);
    
    // TODO: Post announcement to Farcaster
    // TODO: Trigger smart contract execution

    return {
      success: true,
      message: 'Daily raffle executed successfully',
      raffleId: activeRaffle.id,
      winner: {
        fid: winner.user.fid,
        tickets: winner.tickets,
        prize: 500
      },
      totalTickets,
      totalParticipants: activeRaffle.userTickets.length
    };

  } catch (error) {
    console.error('❌ Execute daily raffle error:', error);
    throw error;
  }
}

async function startNextDailyRaffleInternal() {
  console.log('🚀 Starting next daily raffle at 00:01...');
  
  try {
    const now = new Date();
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    // Get current day of week (1-7)
    const dayOfWeek = now.getDay() || 7; // Sunday = 7, Monday = 1, etc.
    
    // Create new daily raffle
    const newRaffle = await prisma.raffle.create({
      data: {
        weekPeriod: `Daily ${now.toISOString().split('T')[0]}`, // "Daily 2025-08-30"
        startDate: now,
        endDate: endDate,
        status: 'ACTIVE',
        raffleType: 'DAILY',
        dayNumber: dayOfWeek,
        prizeAmount: 500 // 500 DEGEN
      }
    });

    console.log(`✅ Created daily raffle ${newRaffle.id} for day ${dayOfWeek}`);

    return {
      success: true,
      message: 'Next daily raffle started',
      raffleId: newRaffle.id,
      dayNumber: dayOfWeek,
      startDate: now.toISOString(),
      endDate: endDate.toISOString()
    };

  } catch (error) {
    console.error('❌ Start next daily raffle error:', error);
    throw error;
  }
}

// GET endpoint for manual testing
export async function GET() {
  return NextResponse.json({
    message: 'Like2Win Daily Raffle Automation API',
    endpoints: {
      'POST /': 'Execute automation actions',
      actions: [
        'execute_daily_raffle - Execute current daily raffle at 23:59',
        'start_next_raffle - Start next daily raffle at 00:01',
        'full_daily_cycle - Execute current and start next'
      ]
    },
    currentTime: new Date().toISOString(),
    nextExecution: '23:59 UTC daily',
    nextStart: '00:01 UTC daily'
  });
}