import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron job endpoint for automatic engagement scanning
 * To be called by Vercel Cron or external scheduler every 6 hours
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🕐 Cron: Starting scheduled engagement scan...');

    // Verify this is a legitimate cron call (basic security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the existing scan-engagement logic
    const scanResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/scan-engagement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!scanResponse.ok) {
      const errorText = await scanResponse.text();
      console.log('❌ Cron scan failed:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Scan failed',
        details: errorText,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const scanResult = await scanResponse.json();
    console.log('✅ Cron scan completed:', scanResult.results);

    // Log the results for monitoring
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'cron_scan',
      success: true,
      results: scanResult.results,
      raffle: scanResult.raffle
    };

    return NextResponse.json({
      success: true,
      message: 'Cron scan completed successfully',
      ...logData
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST endpoint for manual trigger (for testing)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Manual cron trigger...');

    // Call the scan without auth check for manual testing
    const scanResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/scan-engagement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!scanResponse.ok) {
      const errorText = await scanResponse.text();
      return NextResponse.json({
        success: false,
        error: 'Manual scan failed',
        details: errorText
      }, { status: 500 });
    }

    const scanResult = await scanResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Manual cron scan completed',
      trigger: 'manual',
      timestamp: new Date().toISOString(),
      results: scanResult.results,
      raffle: scanResult.raffle
    });

  } catch (error) {
    console.error('❌ Manual cron error:', error);
    return NextResponse.json({
      success: false,
      error: 'Manual cron failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}