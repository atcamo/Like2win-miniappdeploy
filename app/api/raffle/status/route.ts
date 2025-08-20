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

    // Get current active raffle (simplified without relations)
    const currentRaffle = await prisma.raffle.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
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

    // Get user info from custom table
    const user = await prisma.$queryRaw`
      SELECT username, "displayName", "tipAllowanceEnabled", "isFollowingLike2Win", 
             "totalLifetimeTickets", "totalWinnings"
      FROM prisma_users 
      WHERE fid = ${fid}
    `;

    // Calculate user probability
    const userTicketCount = userTickets?.ticketsCount || 0;
    const userProbability = currentRaffle.totalTickets > 0 
      ? (userTicketCount / currentRaffle.totalTickets) * 100 
      : 0;
    
    // Handle query result (array)
    const userData = Array.isArray(user) && user.length > 0 ? user[0] : null;

    // Simplified - no completed raffles yet
    const lastWinners = [];

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
          username: userData?.username,
          displayName: userData?.displayName,
          currentTickets: userTicketCount,
          probability: Number(userProbability.toFixed(1)),
          tipAllowanceEnabled: userData?.tipAllowanceEnabled || false,
          isFollowing: userData?.isFollowingLike2Win || false,
          totalLifetimeTickets: userData?.totalLifetimeTickets || 0,
          totalWinnings: userData?.totalWinnings ? parseFloat(userData.totalWinnings.toString()) : 0
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