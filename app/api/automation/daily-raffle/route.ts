import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { createDegenDistributor } from '@/lib/services/degenDistribution';

const prisma = new PrismaClient();

/**
 * Production Daily Raffle Automation API
 * Real database operations for daily raffle management
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Like2Win Daily Raffle Automation API (Production)',
    status: 'operational',
    lastUpdate: 'September 5, 2025 - Production Migration',
    endpoints: {
      'POST /': 'Execute automation actions with real database operations',
      actions: [
        'execute_daily_raffle - Execute current daily raffle and select winners',
        'start_next_raffle - Create and start next daily raffle',
        'full_daily_cycle - Execute current raffle and start next one'
      ]
    },
    currentTime: new Date().toISOString(),
    nextExecution: '23:59 UTC daily',
    nextStart: '00:01 UTC daily',
    databaseConnection: 'production',
    systemInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      memoryUsage: process.memoryUsage()
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { action, authorization } = await request.json();

    // Verify authorization
    const expectedSecret = process.env.AUTOMATION_SECRET;
    if (!expectedSecret || authorization !== expectedSecret) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized',
        hint: 'Set AUTOMATION_SECRET environment variable'
      }, { status: 401 });
    }

    console.log(`🤖 Daily Raffle Automation (Production): ${action}`);

    switch (action) {
      case 'execute_daily_raffle':
        return await executeCurrentRaffle();
      
      case 'start_next_raffle':
        return await startNextRaffle();
        
      case 'full_daily_cycle':
        return await fullDailyCycle();
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action',
          validActions: [
            'execute_daily_raffle',
            'start_next_raffle', 
            'full_daily_cycle'
          ]
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Production daily raffle automation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Automation failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Execute current active raffle - select winners and update status
 */
async function executeCurrentRaffle() {
  try {
    console.log('🎯 Executing current daily raffle...');

    // Find active raffle
    const activeRaffle = await prisma.raffle.findFirst({
      where: { 
        status: 'ACTIVE',
        raffleType: 'DAILY'
      },
      include: {
        userTickets: {
          where: { ticketsCount: { gt: 0 } },
          include: { user: true }
        }
      }
    });

    if (!activeRaffle) {
      return NextResponse.json({
        success: false,
        error: 'No active daily raffle found to execute',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📊 Found raffle ${activeRaffle.id} with ${activeRaffle.userTickets.length} participants`);

    // If no participants, mark as completed with no winner
    if (activeRaffle.userTickets.length === 0) {
      await prisma.raffle.update({
        where: { id: activeRaffle.id },
        data: {
          status: 'COMPLETED',
          executedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Raffle completed - no participants',
        execution: {
          raffleId: activeRaffle.id,
          totalParticipants: 0,
          totalTickets: 0,
          winner: null,
          reason: 'No participants found'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Calculate total tickets and select winner
    const totalTickets = activeRaffle.userTickets.reduce((sum: number, ut: any) => sum + ut.ticketsCount, 0);
    
    // Generate random winning ticket number
    const winningTicket = Math.floor(Math.random() * totalTickets) + 1;
    
    // Find winner by ticket range
    let currentTicketCount = 0;
    let winner = null;
    
    for (const userTicket of activeRaffle.userTickets) {
      currentTicketCount += userTicket.ticketsCount;
      if (winningTicket <= currentTicketCount) {
        winner = userTicket;
        break;
      }
    }

    if (!winner) {
      throw new Error('Failed to determine winner');
    }

    // Update raffle with winner
    const completedRaffle = await prisma.raffle.update({
      where: { id: activeRaffle.id },
      data: {
        status: 'COMPLETED',
        firstPlaceFid: winner.userFid,
        firstPrize: activeRaffle.prizeAmount || 500,
        totalTickets: totalTickets,
        totalParticipants: activeRaffle.userTickets.length,
        winningTicketNumber: winningTicket,
        executedAt: new Date(),
        randomSeed: `${Date.now()}-${Math.random()}`
      }
    });

    console.log(`🏆 Winner selected: User ${winner.userFid} with ${winner.ticketsCount} tickets (ticket #${winningTicket})`);

    // 🚀 DISTRIBUTE DEGEN TOKENS TO WINNER
    let distributionResult = null;
    try {
      const distributor = createDegenDistributor();
      if (distributor) {
        console.log(`💰 Distributing ${completedRaffle.firstPrize} DEGEN to winner...`);
        distributionResult = await distributor.distributeToWinner(
          winner.userFid.toString(),
          completedRaffle.firstPrize || 500
        );

        if (distributionResult.success) {
          console.log(`✅ Distribution successful: ${distributionResult.transactionHash}`);
        } else {
          console.error(`❌ Distribution failed: ${distributionResult.error}`);
        }
      }
    } catch (distributionError) {
      console.error('❌ Error during token distribution:', distributionError);
      distributionResult = {
        success: false,
        error: distributionError instanceof Error ? distributionError.message : String(distributionError)
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Daily raffle executed successfully',
      execution: {
        raffleId: completedRaffle.id,
        weekPeriod: completedRaffle.weekPeriod,
        totalParticipants: completedRaffle.totalParticipants,
        totalTickets: completedRaffle.totalTickets,
        winner: {
          fid: winner.userFid.toString(),
          username: winner.user?.username,
          displayName: winner.user?.displayName || winner.user?.username,
          tickets: winner.ticketsCount,
          winningTicket: winningTicket,
          prize: completedRaffle.firstPrize
        },
        executedAt: completedRaffle.executedAt?.toISOString(),
        distribution: distributionResult ? {
          success: distributionResult.success,
          transactionHash: distributionResult.transactionHash,
          message: distributionResult.message,
          error: distributionResult.error
        } : { success: false, error: 'Distribution service not available' }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error executing raffle:', error);
    throw error;
  }
}

/**
 * Create and start next daily raffle
 */
async function startNextRaffle() {
  try {
    console.log('🚀 Starting next daily raffle...');

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set start to 00:01 UTC tomorrow
    const startDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 1, 0, 0);
    
    // Set end to 23:59 UTC tomorrow
    const endDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 999);
    
    const dayOfWeek = startDate.getDay() || 7; // Sunday = 7, Monday = 1, etc.
    const weekPeriod = `Daily ${startDate.toISOString().split('T')[0]}`;

    // Create new daily raffle
    const newRaffle = await prisma.raffle.create({
      data: {
        weekPeriod,
        startDate,
        endDate,
        status: 'ACTIVE',
        raffleType: 'DAILY',
        dayNumber: dayOfWeek,
        prizeAmount: 500, // 500 DEGEN
        totalPool: 500,
        totalParticipants: 0,
        totalTickets: 0
      }
    });

    console.log(`✅ Created new daily raffle: ${newRaffle.id} for ${weekPeriod}`);

    return NextResponse.json({
      success: true,
      message: 'Next daily raffle started successfully',
      raffle: {
        id: newRaffle.id,
        weekPeriod: newRaffle.weekPeriod,
        dayNumber: newRaffle.dayNumber,
        startDate: newRaffle.startDate.toISOString(),
        endDate: newRaffle.endDate.toISOString(),
        prizeAmount: newRaffle.prizeAmount,
        status: newRaffle.status
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error starting next raffle:', error);
    throw error;
  }
}

/**
 * Execute current raffle and start next one in sequence
 */
async function fullDailyCycle() {
  try {
    console.log('🔄 Executing full daily raffle cycle...');

    // Step 1: Execute current raffle
    console.log('📊 Step 1: Executing current raffle...');
    const executionResult = await executeCurrentRaffle();
    const executionData = await executionResult.json();

    // Step 2: Start next raffle
    console.log('🚀 Step 2: Starting next raffle...');
    const startResult = await startNextRaffle();
    const startData = await startResult.json();

    return NextResponse.json({
      success: true,
      message: 'Full daily cycle completed successfully',
      cycle: {
        execution: executionData,
        newRaffle: startData,
        completedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in full daily cycle:', error);
    throw error;
  }
}