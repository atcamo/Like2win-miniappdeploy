import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple Daily Raffle Automation API (Without Prisma)
 * For testing automation logic without database dependencies
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Like2Win Daily Raffle Automation API (Simple)',
    status: 'operational',
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
    nextStart: '00:01 UTC daily',
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
    const expectedSecret = process.env.AUTOMATION_SECRET || 'test-secret-123';
    if (authorization !== expectedSecret) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized',
        hint: 'Set AUTOMATION_SECRET environment variable'
      }, { status: 401 });
    }

    console.log(`🤖 Daily Raffle Automation (Simple): ${action}`);

    switch (action) {
      case 'execute_daily_raffle':
        return NextResponse.json({
          success: true,
          message: 'Daily raffle execution simulated',
          action: 'execute_daily_raffle',
          timestamp: new Date().toISOString(),
          simulation: {
            raffleFound: true,
            participants: 0,
            totalTickets: 0,
            winner: null,
            reason: 'No real participants in simulation mode'
          }
        });
      
      case 'start_next_raffle':
        return NextResponse.json({
          success: true,
          message: 'Next daily raffle started (simulated)',
          action: 'start_next_raffle',
          timestamp: new Date().toISOString(),
          simulation: {
            raffleId: `daily-${Date.now()}`,
            dayNumber: new Date().getDay() || 7,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            prizeAmount: 500
          }
        });
        
      case 'full_daily_cycle':
        return NextResponse.json({
          success: true,
          message: 'Full daily cycle completed (simulated)',
          action: 'full_daily_cycle',
          timestamp: new Date().toISOString(),
          simulation: {
            executionResult: {
              success: true,
              participants: 0,
              winner: null
            },
            startResult: {
              success: true,
              newRaffleId: `daily-${Date.now()}`,
              dayNumber: new Date().getDay() || 7
            }
          }
        });
        
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
    console.error('❌ Simple daily raffle automation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Automation failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}