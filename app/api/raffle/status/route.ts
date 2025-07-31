import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET /api/raffle/status?fid=12345
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

    const fid = BigInt(fidParam);

    // Get current active raffle
    const currentRaffle = await prisma.raffle.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: {
        firstPlaceWinner: {
          select: { username: true, displayName: true }
        },
        secondPlaceWinner: {
          select: { username: true, displayName: true }
        },
        thirdPlaceWinner: {
          select: { username: true, displayName: true }
        }
      }
    });

    if (!currentRaffle) {
      return NextResponse.json(
        { error: 'No active raffle found' },
        { status: 404 }
      );
    }

    // Get user tickets for current raffle
    const userTickets = await prisma.userTickets.findUnique({
      where: {
        raffleId_userFid: {
          raffleId: currentRaffle.id,
          userFid: fid
        }
      }
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { fid },
      select: {
        username: true,
        displayName: true,
        tipAllowanceEnabled: true,
        isFollowingLike2Win: true,
        totalLifetimeTickets: true,
        totalWinnings: true
      }
    });

    // Calculate user probability
    const userTicketCount = userTickets?.ticketsCount || 0;
    const userProbability = currentRaffle.totalTickets > 0 
      ? (userTicketCount / currentRaffle.totalTickets) * 100 
      : 0;

    // Get recent winners from last completed raffle
    const lastCompletedRaffle = await prisma.raffle.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { executedAt: 'desc' },
      include: {
        firstPlaceWinner: {
          select: { username: true, displayName: true }
        },
        secondPlaceWinner: {
          select: { username: true, displayName: true }
        },
        thirdPlaceWinner: {
          select: { username: true, displayName: true }
        }
      }
    });

    const lastWinners = [];
    if (lastCompletedRaffle) {
      if (lastCompletedRaffle.firstPlaceWinner) {
        lastWinners.push({
          username: lastCompletedRaffle.firstPlaceWinner.username,
          displayName: lastCompletedRaffle.firstPlaceWinner.displayName,
          prize: lastCompletedRaffle.firstPrize || 0,
          position: 1
        });
      }
      if (lastCompletedRaffle.secondPlaceWinner) {
        lastWinners.push({
          username: lastCompletedRaffle.secondPlaceWinner.username,
          displayName: lastCompletedRaffle.secondPlaceWinner.displayName,
          prize: lastCompletedRaffle.secondPrize || 0,
          position: 2
        });
      }
      if (lastCompletedRaffle.thirdPlaceWinner) {
        lastWinners.push({
          username: lastCompletedRaffle.thirdPlaceWinner.username,
          displayName: lastCompletedRaffle.thirdPlaceWinner.displayName,
          prize: lastCompletedRaffle.thirdPrize || 0,
          position: 3
        });
      }
    }

    // Calculate time until next raffle
    const now = new Date();
    const timeUntilEnd = currentRaffle.endDate.getTime() - now.getTime();
    const hoursUntilEnd = Math.max(0, Math.floor(timeUntilEnd / (1000 * 60 * 60)));
    
    const response = {
      success: true,
      data: {
        raffle: {
          id: currentRaffle.id,
          weekPeriod: currentRaffle.weekPeriod,
          prizePool: currentRaffle.totalPool,
          totalParticipants: currentRaffle.totalParticipants,
          totalTickets: currentRaffle.totalTickets,
          endDate: currentRaffle.endDate.toISOString(),
          timeUntilEnd: `${Math.floor(hoursUntilEnd / 24)}d ${hoursUntilEnd % 24}h`,
          isSelfSustaining: currentRaffle.isSelfSustaining
        },
        user: {
          fid: fid.toString(),
          username: user?.username,
          displayName: user?.displayName,
          currentTickets: userTicketCount,
          probability: Number(userProbability.toFixed(1)),
          tipAllowanceEnabled: user?.tipAllowanceEnabled || false,
          isFollowing: user?.isFollowingLike2Win || false,
          totalLifetimeTickets: user?.totalLifetimeTickets || 0,
          totalWinnings: user?.totalWinnings ? parseFloat(user.totalWinnings.toString()) : 0
        },
        lastWinners
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching raffle status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}