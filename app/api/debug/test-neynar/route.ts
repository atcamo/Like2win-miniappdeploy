import { NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';

/**
 * Test endpoint to directly test Neynar API functionality
 */
export async function GET() {
  try {
    console.log('🧪 Starting direct Neynar API test...');
    
    // Test with known FIDs from our leaderboard
    const testFids = ['432789', '546204', '589396'];
    
    console.log('📋 Testing FIDs:', testFids);
    
    // Try to resolve users
    const users = await userService.resolveUsers(testFids);
    
    console.log('✅ UserService.resolveUsers completed');
    console.log('📊 Results:', users);
    
    // Also test the Neynar API directly
    const apiKey = process.env.NEYNAR_API_KEY;
    const directApiTest = await testDirectNeynarAPI(testFids, apiKey!);
    
    return NextResponse.json({
      success: true,
      test: {
        userServiceResults: users,
        directApiTest,
        apiKeyStatus: {
          hasKey: !!apiKey,
          keyLength: apiKey?.length || 0,
          keyPreview: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'none'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

async function testDirectNeynarAPI(fids: string[], apiKey: string) {
  try {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids.join(',')}`;
    
    console.log('🌐 Direct API test URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    console.log('📡 Direct API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Direct API error:', errorText);
      return {
        success: false,
        error: `${response.status}: ${errorText}`
      };
    }
    
    const data = await response.json();
    console.log('📋 Direct API data keys:', Object.keys(data));
    console.log('👥 Users count:', data.users?.length || 0);
    
    return {
      success: true,
      usersCount: data.users?.length || 0,
      sampleUser: data.users?.[0] ? {
        fid: data.users[0].fid,
        username: data.users[0].username,
        display_name: data.users[0].display_name,
        pfp_url: data.users[0].pfp_url
      } : null,
      rawResponse: data
    };
    
  } catch (error) {
    console.error('❌ Direct API test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}