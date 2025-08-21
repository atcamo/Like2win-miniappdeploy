import { NextRequest, NextResponse } from 'next/server';
import { SimpleEngagementService } from '../../../../lib/services/engagementServiceSimple';

/**
 * Debug endpoint to test engagement step by step
 */
export async function POST(request: NextRequest) {
  try {
    const { userFid, raffleId, testType } = await request.json();
    
    console.log('🔍 Debug engagement request:', { userFid, raffleId, testType });

    if (testType === 'step-by-step') {
      // Test each database operation separately
      const results = await SimpleEngagementService.testDatabaseOperations(
        userFid || '546204',
        raffleId || '078adf95-4cc1-4569-9343-0337eb2ba356'
      );

      return NextResponse.json({
        success: true,
        testType: 'step-by-step',
        results
      });
    }

    if (testType === 'simple-award') {
      // Test simple ticket awarding
      const result = await SimpleEngagementService.awardTicketSimple(
        userFid || '546204',
        raffleId || '078adf95-4cc1-4569-9343-0337eb2ba356',
        `debug_cast_${Date.now()}`
      );

      return NextResponse.json({
        success: result.success,
        testType: 'simple-award',
        result
      });
    }

    return NextResponse.json({
      error: 'Invalid testType. Use "step-by-step" or "simple-award"'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * GET endpoint for debug info
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Engagement Debug Endpoint',
    description: 'Step-by-step testing of engagement service',
    usage: {
      'POST with testType "step-by-step"': 'Test each database operation separately',
      'POST with testType "simple-award"': 'Test simple ticket awarding',
    },
    defaultValues: {
      userFid: '546204',
      raffleId: '078adf95-4cc1-4569-9343-0337eb2ba356'
    }
  });
}