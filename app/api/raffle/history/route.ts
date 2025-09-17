import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * Raffle History API
 * Shows completed raffles with winners and prize distribution
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`📊 Raffle History API (limit: ${limit})`);

    // Get completed raffles ordered by execution date (most recent first)
    const completedRaffles = await prisma.raffle.findMany({
      where: {
        status: 'COMPLETED',
        executedAt: { not: null }
      },
      orderBy: { executedAt: 'desc' },
      take: limit,
      include: {
        userTickets: {
          where: { ticketsCount: { gt: 0 } },
          include: { user: true }
        }
      }
    });

    const historyData = completedRaffles.map(raffle => ({
      id: raffle.id,
      weekPeriod: raffle.weekPeriod,
      raffleType: raffle.raffleType,
      dayNumber: raffle.dayNumber,
      executedAt: raffle.executedAt?.toISOString(),
      totalParticipants: raffle.totalParticipants,
      totalTickets: raffle.totalTickets,
      totalPool: raffle.totalPool,

      // Winner information
      firstPlace: raffle.firstPlaceFid ? {
        fid: raffle.firstPlaceFid.toString(),
        prize: raffle.firstPrize,
        winningTicket: raffle.winningTicketNumber
      } : null,

      secondPlace: raffle.secondPlaceFid ? {
        fid: raffle.secondPlaceFid.toString(),
        prize: raffle.secondPrize
      } : null,

      // Additional details
      startDate: raffle.startDate.toISOString(),
      endDate: raffle.endDate.toISOString(),
      randomSeed: raffle.randomSeed
    }));

    return NextResponse.json({
      success: true,
      message: `Found ${completedRaffles.length} completed raffles`,
      history: historyData,
      pagination: {
        limit,
        returned: completedRaffles.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Raffle history error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch raffle history',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}