import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test 1: Basic Prisma connection
    console.log('Testing Prisma connection...');
    
    // Test 2: Check raffles table
    const raffleCount = await prisma.$queryRaw`SELECT COUNT(*) FROM raffles`;
    console.log('Raffle count:', raffleCount);
    
    // Test 3: Get active raffle
    const activeRaffle = await prisma.raffle.findFirst({
      where: { status: 'ACTIVE' }
    });
    console.log('Active raffle:', activeRaffle);
    
    // Test 4: Check users table
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) FROM prisma_users`;
    console.log('User count:', userCount);
    
    return NextResponse.json({
      success: true,
      tests: {
        raffleCount,
        activeRaffle: activeRaffle ? 'Found' : 'Not found',
        userCount
      }
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}