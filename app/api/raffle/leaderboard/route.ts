import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET /api/raffle/leaderboard?raffle_id=uuid (optional)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const raffleId = searchParams.get('raffle_id');

    let targetRaffle;

    if (raffleId) {
      // Get specific raffle
      targetRaffle = await prisma.raffle.findUnique({
        where: { id: raffleId }
      });
    } else {
      // Get current active raffle
      targetRaffle = await prisma.raffle.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!targetRaffle) {
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      );
    }

    // Get leaderboard for this raffle
    const leaderboard = await prisma.userTickets.findMany({
      where: { raffleId: targetRaffle.id },
      orderBy: [
        { ticketsCount: 'desc' },
        { firstLikeAt: 'asc' } // Tie breaker: first to participate
      ],
      take: 50, // Top 50 participants
      include: {
        user: {
          select: {
            fid: true,
            username: true,
            displayName: true,
            pfpUrl: true,
            totalLifetimeTickets: true,
            totalWinnings: true
          }
        }
      }
    });

    // Get total stats for the raffle
    const totalStats = await prisma.raffle.findUnique({
      where: { id: targetRaffle.id },
      select: {
        totalParticipants: true,
        totalTickets: true,
        totalPool: true,
        isSelfSustaining: true
      }
    });

    // Format leaderboard data
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      fid: entry.user.fid?.toString(),
      username: entry.user.username,
      displayName: entry.user.displayName,
      profilePicture: entry.user.pfpUrl,
      tickets: entry.ticketsCount,
      probability: totalStats?.totalTickets 
        ? Number(((entry.ticketsCount / totalStats.totalTickets) * 100).toFixed(2))
        : 0,
      totalLifetimeTickets: entry.user.totalLifetimeTickets,
      totalWinnings: entry.user.totalWinnings 
        ? parseFloat(entry.user.totalWinnings.toString()) 
        : 0,
      firstLikeAt: entry.firstLikeAt?.toISOString(),
      lastLikeAt: entry.lastLikeAt?.toISOString()
    }));

    const response = {
      success: true,
      data: {
        raffle: {
          id: targetRaffle.id,
          weekPeriod: targetRaffle.weekPeriod,
          status: targetRaffle.status,
          totalParticipants: totalStats?.totalParticipants || 0,
          totalTickets: totalStats?.totalTickets || 0,
          prizePool: totalStats?.totalPool || 0,
          isSelfSustaining: totalStats?.isSelfSustaining || false
        },
        leaderboard: formattedLeaderboard,
        meta: {
          totalEntries: leaderboard.length,
          maxRank: Math.min(50, leaderboard.length)
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}