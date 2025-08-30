import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron job to automatically update local data files 
 * Runs periodically to refresh historical likes data
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🕐 Cron: Updating local data...');

    // Verify cron authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    
    // Call the local data loading endpoint
    const updateResponse = await fetch(`${baseUrl}/api/admin/load-historical-local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: '2025-08-18T00:00:00.000Z',
        endDate: new Date().toISOString(),
        forceRefresh: true
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.log('❌ Local data update failed:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Local data update failed',
        details: errorText,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Local data updated:', updateResult.summary);

    return NextResponse.json({
      success: true,
      message: 'Local data updated successfully',
      timestamp: new Date().toISOString(),
      summary: updateResult.summary,
      trigger: 'cron'
    });

  } catch (error) {
    console.error('❌ Cron local data update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Cron local data update failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST endpoint for manual trigger
 */
export async function POST() {
  try {
    console.log('🔧 Manual local data update...');

    // Get base URL  
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    
    const updateResponse = await fetch(`${baseUrl}/api/admin/load-historical-local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: '2025-08-18T00:00:00.000Z',
        endDate: new Date().toISOString(), 
        forceRefresh: true
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      return NextResponse.json({
        success: false,
        error: 'Manual local data update failed',
        details: errorText
      }, { status: 500 });
    }

    const updateResult = await updateResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Manual local data update completed',
      trigger: 'manual',
      timestamp: new Date().toISOString(),
      summary: updateResult.summary
    });

  } catch (error) {
    console.error('❌ Manual local data update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Manual local data update failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}