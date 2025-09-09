import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleService } from '@/lib/services/dailyRaffleService';

/**
 * Raffle Participation API (Daily Reset Fixed)
 * Uses in-memory storage with daily reset
 */
export async function POST(request: NextRequest) {
  try {
    const { userFid, action } = await request.json();

    if (!userFid) {
      return NextResponse.json(
        { error: 'Missing required parameter: userFid' },
        { status: 400 }
      );
    }

    console.log(`🎫 Raffle Participation (Daily Reset): User ${userFid}, Action: ${action || 'participate'}`);

    // Add tickets using the daily raffle service
    const ticketsToAdd = 1; // Base participation gives 1 ticket
    const userTickets = dailyRaffleService.addTickets(parseInt(userFid), ticketsToAdd, action || 'participate');
    const raffleInfo = dailyRaffleService.getRaffleInfo();

    const response = {
      success: true,
      message: 'Participation recorded (daily reset active)',
      participation: {
        userFid: parseInt(userFid),
        action: action || 'participate',
        ticketsEarned: ticketsToAdd,
        totalTickets: userTickets.tickets,
        raffleId: raffleInfo.id,
        requirements: {
          followCheck: {
            status: 'daily_reset',
            isFollowing: false,
            message: 'Please follow @Like2Win'
          },
          engagementCheck: {
            status: 'daily_reset',
            hasDegenHat: false,
            requiredActions: ['like', 'recast', 'comment'],
            completedActions: userTickets.engagements,
            message: `Participation recorded - ${userTickets.tickets} total tickets today`
          }
        },
        nextSteps: [
          'Keep following @Like2Win',
          'Engage with today\'s posts for more tickets',
          'Tickets reset daily at midnight UTC - no historical accumulation'
        ],
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Participation error:', error);
    return NextResponse.json(
      { 
        error: 'Participation failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check participation eligibility (Daily Reset)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFid = searchParams.get('fid');

    if (!userFid) {
      return NextResponse.json(
        { error: 'Missing required parameter: fid' },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking participation eligibility (Daily Reset) for user ${userFid}`);

    // Get current user tickets from daily service
    const userTickets = dailyRaffleService.getUserTickets(parseInt(userFid));
    const currentTickets = userTickets?.tickets || 0;

    return NextResponse.json({
      success: true,
      source: 'daily_reset',
      eligibility: {
        userFid: parseInt(userFid),
        canParticipate: true,
        currentTickets: currentTickets,
        isFollowing: false,
        hasDegenHat: false,
        engagementCount: userTickets?.engagements.length || 0,
        requirements: {
          follow: {
            required: true,
            completed: false,
            description: 'Must follow @Like2Win'
          },
          engagement: {
            required: true,
            completed: false,
            description: 'Without 🎩 DEGEN: like + recast + comment required'
          }
        },
        nextActions: [
          'Follow @Like2Win',
          'Engage with today\'s posts to earn tickets',
          'Tickets reset daily at midnight UTC'
        ]
      },
      timestamp: new Date().toISOString(),
      message: `Daily reset active - showing ${currentTickets} tickets earned today`
    });

  } catch (error) {
    console.error('❌ Eligibility check error:', error);
    return NextResponse.json(
      { 
        error: 'Eligibility check failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}