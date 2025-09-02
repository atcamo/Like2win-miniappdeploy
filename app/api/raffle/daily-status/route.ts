import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Daily Raffle Status API
 * Returns current daily raffle status and user participation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fidParam = searchParams.get('fid');
    
    if (!fidParam) {
      return NextResponse.json(
        { error: 'FID parameter is required' },
        { status: 400 }
      );
    }

    const userFid = BigInt(fidParam);

    // Get current active daily raffle
    const currentRaffle = await prisma.raffle.findFirst({
      where: {
        status: 'ACTIVE',
        raffleType: 'DAILY'
      },
      include: {
        userTickets: true,
        _count: {
          select: {
            userTickets: true
          }
        }
      }
    });

    if (!currentRaffle) {
      return NextResponse.json({
        success: false,
        error: 'No active daily raffle found'
      });
    }

    // Get user's tickets for current raffle
    const userTickets = await prisma.userTickets.findUnique({
      where: {
        raffleId_userFid: {
          raffleId: currentRaffle.id,
          userFid: userFid
        }
      }
    });

    // Get user data
    const user = await prisma.user.findUnique({
      where: { fid: userFid },
      select: {
        fid: true,
        username: true,
        displayName: true,
        pfpUrl: true,
        isFollowingLike2Win: true,
        totalLifetimeTickets: true,
        totalWinnings: true,
        tipAllowanceEnabled: true
      }
    });

    // Calculate time until raffle ends
    const now = new Date();
    const endTime = new Date(currentRaffle.endDate);
    const timeUntilEnd = Math.max(0, endTime.getTime() - now.getTime());
    
    // Format time remaining
    const hours = Math.floor(timeUntilEnd / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60));
    const timeUntilEndFormatted = `${hours}h ${minutes}m`;

    // Calculate user probability
    const userTicketCount = userTickets?.tickets || 0;
    const totalTickets = currentRaffle.totalTickets || 0;
    const probability = totalTickets > 0 ? ((userTicketCount / totalTickets) * 100) : 0;

    const response = {
      success: true,
      data: {
        raffle: {
          id: currentRaffle.id,
          weekPeriod: currentRaffle.weekPeriod,
          raffleType: 'DAILY',
          dayNumber: currentRaffle.dayNumber,
          prizePool: currentRaffle.prizeAmount || 500, // 500 DEGEN daily
          totalParticipants: currentRaffle._count.userTickets,
          totalTickets: currentRaffle.totalTickets,
          startDate: currentRaffle.startDate.toISOString(),
          endDate: currentRaffle.endDate.toISOString(),
          timeUntilEnd: timeUntilEndFormatted,
          timeUntilEndMs: timeUntilEnd,
          status: currentRaffle.status
        },
        user: user ? {
          fid: user.fid.toString(),
          username: user.username,
          displayName: user.displayName,
          pfpUrl: user.pfpUrl,
          currentTickets: userTicketCount,
          probability: Math.round(probability * 100) / 100, // Round to 2 decimals
          tipAllowanceEnabled: user.tipAllowanceEnabled,
          isFollowing: user.isFollowingLike2Win,
          totalLifetimeTickets: user.totalLifetimeTickets,
          totalWinnings: user.totalWinnings ? parseFloat(user.totalWinnings.toString()) : 0
        } : null,
        // Get recent winners from completed daily raffles
        recentDailyWinners: await getRecentDailyWinners()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Daily raffle status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get daily raffle status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

async function getRecentDailyWinners() {
  try {
    const recentWinners = await prisma.raffle.findMany({
      where: {
        status: 'COMPLETED',
        raffleType: 'DAILY',
        firstPlaceFid: {
          not: null
        }
      },
      include: {
        firstPlaceWinner: {
          select: {
            fid: true,
            username: true,
            displayName: true,
            pfpUrl: true
          }
        }
      },
      orderBy: {
        executedAt: 'desc'
      },
      take: 5 // Last 5 daily winners
    });

    return recentWinners.map((raffle: any) => ({
      raffleId: raffle.id,
      weekPeriod: raffle.weekPeriod,
      dayNumber: raffle.dayNumber,
      executedAt: raffle.executedAt?.toISOString(),
      prize: raffle.firstPrize || 500,
      winner: raffle.firstPlaceWinner ? {
        fid: raffle.firstPlaceWinner.fid.toString(),
        username: raffle.firstPlaceWinner.username,
        displayName: raffle.firstPlaceWinner.displayName,
        pfpUrl: raffle.firstPlaceWinner.pfpUrl
      } : null
    }));

  } catch (error) {
    console.error('Error getting recent daily winners:', error);
    return [];
  }
}