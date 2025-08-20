import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test simple raffle query only
    const activeRaffle = await prisma.raffle.findFirst({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        weekPeriod: true,
        status: true,
        totalPool: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      success: true,
      activeRaffle: activeRaffle ? {
        id: activeRaffle.id,
        weekPeriod: activeRaffle.weekPeriod,
        status: activeRaffle.status,
        totalPool: activeRaffle.totalPool.toString(),
        createdAt: activeRaffle.createdAt.toISOString()
      } : 'Not found',
      connection: 'OK'
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}