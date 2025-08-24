import { NextRequest, NextResponse } from 'next/server';

/**
 * Search for user information using various methods
 * Try to find @Like2Win's correct FID and verify account exists
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'like2win';
    
    console.log(`🔍 Searching for user: ${username}`);

    const results: any = {
      searchTerm: username,
      timestamp: new Date().toISOString(),
      methods: {},
      analysis: {}
    };

    // Method 1: Try web scraping Warpcast profile
    try {
      console.log('📱 Method 1: Web scraping Warpcast profile...');
      const profileResponse = await fetch(`https://warpcast.com/${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      if (profileResponse.ok) {
        const html = await profileResponse.text();
        
        // Look for FID in the HTML
        const fidMatches = html.match(/fid[":]\s*(\d+)/gi);
        const userIdMatches = html.match(/user[_-]?id[":]\s*(\d+)/gi);
        const profileMatches = html.match(/profile[":][^}]*fid[":]\s*(\d+)/gi);
        
        results.methods.webScraping = {
          success: true,
          status: profileResponse.status,
          fidMatches: fidMatches || [],
          userIdMatches: userIdMatches || [],
          profileMatches: profileMatches || [],
          htmlLength: html.length,
          containsUsername: html.toLowerCase().includes(username.toLowerCase())
        };

        // Extract potential FIDs
        const potentialFids = new Set();
        [...(fidMatches || []), ...(userIdMatches || []), ...(profileMatches || [])].forEach(match => {
          const numbers = match.match(/\d+/g);
          if (numbers) {
            numbers.forEach(num => {
              const fid = parseInt(num);
              if (fid > 1000 && fid < 10000000) { // Reasonable FID range
                potentialFids.add(fid);
              }
            });
          }
        });

        results.analysis.potentialFids = Array.from(potentialFids);
      } else {
        results.methods.webScraping = {
          success: false,
          status: profileResponse.status,
          error: `HTTP ${profileResponse.status}`
        };
      }
    } catch (error) {
      results.methods.webScraping = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Method 2: Check common FID patterns for like2win
    console.log('🔢 Method 2: Testing common FID patterns...');
    const commonFids = [
      1206612, // Current assumption
      418671,  // itsai's FID for reference
      123456,  // Test patterns
      654321,
      1000000,
      2000000
    ];

    results.methods.fidTesting = {
      currentAssumption: 1206612,
      tested: [],
      notes: 'Testing without API key - limited verification possible'
    };

    for (const testFid of commonFids) {
      try {
        // Try to access some public endpoint that might work
        const testResponse = await fetch(`https://hub-api.neynar.com/v1/userByFid?fid=${testFid}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Like2WinBot/1.0)'
          }
        });

        results.methods.fidTesting.tested.push({
          fid: testFid,
          status: testResponse.status,
          accessible: testResponse.status !== 404,
          note: testFid === 1206612 ? 'Current assumption' : 
                testFid === 418671 ? 'itsai for reference' : 'test pattern'
        });
      } catch (error) {
        results.methods.fidTesting.tested.push({
          fid: testFid,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown'
        });
      }
    }

    // Method 3: Database check - verify what we have stored
    try {
      console.log('💾 Method 3: Database verification...');
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1
      });

      try {
        // Check if we have any engagement logs that mention like2win posts
        const engagementCheck = await pool.query(`
          SELECT DISTINCT "castHash", COUNT(*) as likes, 
                 MAX("createdAt") as latest_activity
          FROM engagement_log 
          GROUP BY "castHash"
          ORDER BY likes DESC
          LIMIT 5
        `);

        // Check user_tickets for FID patterns
        const fidsInDb = await pool.query(`
          SELECT DISTINCT "userFid", "ticketsCount"
          FROM user_tickets 
          ORDER BY "ticketsCount" DESC
          LIMIT 10
        `);

        results.methods.databaseCheck = {
          engagementLogs: engagementCheck.rows.length,
          topCasts: engagementCheck.rows,
          userFids: fidsInDb.rows.map((r: any) => ({
            fid: r.userFid.toString(),
            tickets: r.ticketsCount
          }))
        };
      } finally {
        await pool.end();
      }
    } catch (error) {
      results.methods.databaseCheck = {
        error: error instanceof Error ? error.message : 'Database error'
      };
    }

    // Generate recommendations
    results.recommendations = [];

    if (results.analysis.potentialFids?.length > 0) {
      results.recommendations.push({
        priority: 'HIGH',
        action: `Verify FID ${results.analysis.potentialFids[0]}`,
        description: `Web scraping found potential FID: ${results.analysis.potentialFids.join(', ')}`,
        nextStep: 'Update FID in webhook and EngagementService'
      });
    }

    results.recommendations.push({
      priority: 'HIGH',
      action: 'Get NEYNAR_API_KEY',
      description: 'Only way to reliably verify user data and detect likes',
      url: 'https://neynar.com/dashboard'
    });

    if (!results.methods.webScraping?.success) {
      results.recommendations.push({
        priority: 'MEDIUM',
        action: 'Manual FID verification',
        description: 'Check @like2win profile manually to confirm FID',
        method: 'Visit warpcast.com/like2win and inspect network tab'
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      summary: {
        username: username,
        potentialFids: results.analysis.potentialFids || [],
        canVerify: !!process.env.NEYNAR_API_KEY,
        nextAction: results.analysis.potentialFids?.length > 0 ? 
          'Test with new FID' : 'Get API key for proper verification'
      }
    });

  } catch (error) {
    console.error('❌ Error searching user:', error);
    return NextResponse.json({
      error: 'Failed to search user',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}