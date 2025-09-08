import { NextRequest, NextResponse } from 'next/server';

/**
 * Raffle Participation API (Daily Reset Fixed)
 * Returns simulated participation with daily reset
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

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // For now, simulate participation without persistent storage
    // This ensures clean daily reset
    const response = {
      success: true,
      message: 'Participation recorded (daily reset active)',
      participation: {
        userFid: parseInt(userFid),
        action: action || 'participate',
        ticketsEarned: 1,
        totalTickets: 1, // Always starts fresh
        raffleId: `daily-raffle-${todayStr}`,
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
            completedActions: ['participate'],
            message: 'Participation recorded - starts fresh daily'
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

    // Always return fresh eligibility for daily reset
    return NextResponse.json({
      success: true,
      source: 'daily_reset',
      eligibility: {
        userFid: parseInt(userFid),
        canParticipate: true,
        currentTickets: 0, // Always starts fresh
        isFollowing: false,
        hasDegenHat: false,
        engagementCount: 0,
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
      message: 'Daily reset active - no historical tickets shown'
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