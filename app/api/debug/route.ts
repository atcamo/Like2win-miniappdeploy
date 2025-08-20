import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    // Test database connection with raw query to avoid prepared statement conflicts
    const result = await prisma.$queryRaw`
      SELECT id, week_period as "weekPeriod", status, total_pool as "totalPool", created_at as "createdAt"
      FROM raffles 
      WHERE status = 'ACTIVE' 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const activeRaffle = Array.isArray(result) && result.length > 0 ? result[0] : null;
    
    return NextResponse.json({
      success: true,
      activeRaffle: activeRaffle ? {
        id: activeRaffle.id,
        weekPeriod: activeRaffle.weekPeriod,
        status: activeRaffle.status,
        totalPool: activeRaffle.totalPool.toString(),
        createdAt: new Date(activeRaffle.createdAt).toISOString()
      } : 'Not found',
      connection: 'OK'
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}