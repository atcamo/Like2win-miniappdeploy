import { NextRequest, NextResponse } from 'next/server';
import { dailyRaffleRedisService } from '@/lib/services/dailyRaffleRedisService';

export async function GET(request: NextRequest) {
  try {
    const debugInfo = await dailyRaffleRedisService.getDebugInfo();
    
    return NextResponse.json({
      redisEnvironment: {
        hasRedisUrl: !!process.env.REDIS_URL,
        redisUrlStart: process.env.REDIS_URL?.substring(0, 20) + '...',
        hasRedisToken: !!process.env.REDIS_TOKEN,
        redisTokenLength: process.env.REDIS_TOKEN?.length || 0
      },
      debugInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}