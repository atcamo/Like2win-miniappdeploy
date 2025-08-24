import { NextRequest, NextResponse } from 'next/server';

/**
 * Check alternative ways to get Like2Win engagement data without Neynar API key
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking alternative data sources for Like2Win...');

    const results: any = {
      timestamp: new Date().toISOString(),
      alternatives: {},
      recommendations: []
    };

    // 1. Try Warpcast direct (no API key needed sometimes)
    try {
      console.log('📱 Testing Warpcast direct access...');
      const warpcastResponse = await fetch('https://warpcast.com/like2win', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Like2WinBot/1.0)'
        }
      });
      
      results.alternatives.warpcast = {
        status: warpcastResponse.status,
        accessible: warpcastResponse.ok,
        note: warpcastResponse.ok ? 'Profile accessible' : 'Profile not accessible'
      };
    } catch (error) {
      results.alternatives.warpcast = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 2. Try Hub API (some endpoints might be public)
    try {
      console.log('🌐 Testing Farcaster Hub API...');
      // Test if we can access hub data
      const hubResponse = await fetch('https://hub-api.neynar.com/v1/info', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Like2WinBot/1.0)'
        }
      });
      
      results.alternatives.hubApi = {
        status: hubResponse.status,
        accessible: hubResponse.ok,
        note: hubResponse.ok ? 'Hub info accessible' : 'Hub not accessible'
      };
    } catch (error) {
      results.alternatives.hubApi = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 3. Check if we can use RSS or web scraping
    try {
      console.log('📡 Testing RSS/feed alternatives...');
      const feedResponse = await fetch('https://warpcast.com/like2win/rss', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Like2WinBot/1.0)'
        }
      });
      
      results.alternatives.rssFeed = {
        status: feedResponse.status,
        accessible: feedResponse.ok,
        note: feedResponse.ok ? 'RSS feed accessible' : 'No RSS feed'
      };
    } catch (error) {
      results.alternatives.rssFeed = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 4. Check current environment variables
    const hasNeynarKey = !!process.env.NEYNAR_API_KEY;
    results.environment = {
      neynarApiKey: hasNeynarKey ? 'configured' : 'missing',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    };

    // 5. Generate recommendations
    if (!hasNeynarKey) {
      results.recommendations.push({
        priority: 'HIGH',
        action: 'Configure NEYNAR_API_KEY',
        description: 'Add NEYNAR_API_KEY to Vercel environment variables',
        impact: 'Enable real-time like detection via webhooks'
      });
    }

    results.recommendations.push({
      priority: 'MEDIUM',
      action: 'Manual scanning',
      description: 'Create periodic job to scan @Like2Win posts for likes',
      impact: 'Detect likes retroactively (not real-time)'
    });

    if (results.alternatives.warpcast?.accessible) {
      results.recommendations.push({
        priority: 'LOW',
        action: 'Web scraping',
        description: 'Parse Warpcast profile page for engagement data',
        impact: 'Limited data, rate limits, unreliable'
      });
    }

    // 6. Specific steps to fix the issue
    results.nextSteps = [
      '1. Get NEYNAR_API_KEY from https://neynar.com/dashboard',
      '2. Add it to Vercel environment variables',
      '3. Run webhook setup: node scripts/setup-webhook.js',
      '4. Test webhook: POST /api/webhooks/neynar',
      '5. Scan existing likes: POST /api/admin/scan-likes'
    ];

    return NextResponse.json({
      success: true,
      data: results,
      summary: {
        canDetectLikes: hasNeynarKey,
        blockers: hasNeynarKey ? [] : ['Missing NEYNAR_API_KEY'],
        immediateAction: hasNeynarKey ? 
          'Run scan-likes to detect existing engagement' : 
          'Configure NEYNAR_API_KEY in Vercel dashboard'
      }
    });

  } catch (error) {
    console.error('❌ Error checking alternatives:', error);
    return NextResponse.json({
      error: 'Failed to check alternatives',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}