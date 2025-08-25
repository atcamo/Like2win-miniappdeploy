import { NextRequest, NextResponse } from 'next/server';

/**
 * Test Neynar API directly to find correct endpoint
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Neynar API directly...');

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({
        error: 'NEYNAR_API_KEY not configured'
      }, { status: 400 });
    }

    const testHash = '0x4429321a2723b4b67b9bbe33af136ffa0f32a289';
    const tests = [];

    // Test 1: With trailing slash
    try {
      console.log('🧪 Test 1: With trailing slash');
      const url1 = `https://api.neynar.com/v2/farcaster/cast/reactions/?cast_hash=${testHash}&types=likes&limit=25`;
      const response1 = await fetch(url1, {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY
        }
      });

      tests.push({
        test: 'With trailing slash',
        url: url1,
        status: response1.status,
        ok: response1.ok,
        response: response1.ok ? await response1.json() : await response1.text()
      });
    } catch (error) {
      tests.push({
        test: 'With trailing slash',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 2: Without trailing slash
    try {
      console.log('🧪 Test 2: Without trailing slash');
      const url2 = `https://api.neynar.com/v2/farcaster/cast/reactions?cast_hash=${testHash}&types=likes&limit=25`;
      const response2 = await fetch(url2, {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY
        }
      });

      tests.push({
        test: 'Without trailing slash',
        url: url2,
        status: response2.status,
        ok: response2.ok,
        response: response2.ok ? await response2.json() : await response2.text()
      });
    } catch (error) {
      tests.push({
        test: 'Without trailing slash',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 3: Try different parameter names
    try {
      console.log('🧪 Test 3: Different parameter name (hash)');
      const url3 = `https://api.neynar.com/v2/farcaster/cast/reactions?hash=${testHash}&types=likes&limit=25`;
      const response3 = await fetch(url3, {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY
        }
      });

      tests.push({
        test: 'Parameter: hash',
        url: url3,
        status: response3.status,
        ok: response3.ok,
        response: response3.ok ? await response3.json() : await response3.text()
      });
    } catch (error) {
      tests.push({
        test: 'Parameter: hash',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 4: Try SDK approach
    try {
      console.log('🧪 Test 4: Different parameter structure');
      const url4 = `https://api.neynar.com/v2/farcaster/cast/reactions?identifier=${testHash}&type=hash&limit=25`;
      const response4 = await fetch(url4, {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY
        }
      });

      tests.push({
        test: 'SDK-style parameters',
        url: url4,
        status: response4.status,
        ok: response4.ok,
        response: response4.ok ? await response4.json() : await response4.text()
      });
    } catch (error) {
      tests.push({
        test: 'SDK-style parameters',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Direct Neynar API tests completed',
      testHash,
      tests,
      summary: {
        totalTests: tests.length,
        successfulTests: tests.filter(t => t.ok).length,
        workingEndpoint: tests.find(t => t.ok)?.url || 'None found'
      }
    });

  } catch (error) {
    console.error('❌ Error testing Neynar API directly:', error);
    return NextResponse.json({
      error: 'Failed to test Neynar API',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}