import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const castHash = searchParams.get('hash');
  const userFid = searchParams.get('userFid');

  if (!castHash || !userFid) {
    return NextResponse.json({ 
      error: 'Missing required parameters: hash and userFid' 
    }, { status: 400 });
  }

  const results = {
    castHash,
    userFid,
    tests: [] as any[],
    summary: {
      hasLiked: false,
      hasRecasted: false,
      apiWorking: false,
      errors: [] as string[]
    }
  };

  // Test 1: Correct Neynar endpoint
  try {
    console.log('🧪 Testing correct Neynar reactions endpoint...');
    
    const correctEndpoint = `https://api.neynar.com/v2/farcaster/reactions/cast/?hash=${castHash}&types=likes,recasts&limit=100`;
    
    const response = await fetch(correctEndpoint, {
      headers: {
        'x-api-key': process.env.NEYNAR_API_KEY!,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();
    
    results.tests.push({
      test: 'Correct Neynar Endpoint',
      endpoint: correctEndpoint,
      status: response.status,
      success: response.status === 200,
      responseKeys: Object.keys(responseData),
      sampleData: responseData
    });

    if (response.status === 200) {
      results.summary.apiWorking = true;
      
      // Check for likes
      const reactions = responseData.reactions || [];
      const userLikes = reactions.filter((r: any) => 
        r.reaction_type === 'like' && 
        (r.user?.fid === parseInt(userFid) || r.fid === parseInt(userFid))
      );
      
      const userRecasts = reactions.filter((r: any) => 
        r.reaction_type === 'recast' && 
        (r.user?.fid === parseInt(userFid) || r.fid === parseInt(userFid))
      );

      results.summary.hasLiked = userLikes.length > 0;
      results.summary.hasRecasted = userRecasts.length > 0;
      
      results.tests.push({
        test: 'User Reactions Analysis',
        totalReactions: reactions.length,
        userLikes: userLikes.length,
        userRecasts: userRecasts.length,
        userLikeDetails: userLikes,
        userRecastDetails: userRecasts
      });
    }
    
  } catch (error) {
    results.summary.errors.push(`Correct endpoint error: ${error}`);
    results.tests.push({
      test: 'Correct Neynar Endpoint',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 2: Old incorrect endpoint (for comparison)
  try {
    console.log('🧪 Testing old incorrect endpoint...');
    
    const oldEndpoint = `https://api.neynar.com/v2/farcaster/cast/reactions?hash=${castHash}&types=likes,recasts&limit=100`;
    
    const response = await fetch(oldEndpoint, {
      headers: {
        'Authorization': `Bearer ${process.env.NEYNAR_API_KEY!}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();
    
    results.tests.push({
      test: 'Old Incorrect Endpoint',
      endpoint: oldEndpoint,
      status: response.status,
      success: response.status === 200,
      responseData
    });
    
  } catch (error) {
    results.tests.push({
      test: 'Old Incorrect Endpoint',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 3: API Key validation
  try {
    console.log('🧪 Testing API key validation...');
    
    const testEndpoint = 'https://api.neynar.com/v2/farcaster/user/search?q=dwr&limit=1';
    
    const response = await fetch(testEndpoint, {
      headers: {
        'x-api-key': process.env.NEYNAR_API_KEY!,
        'Content-Type': 'application/json'
      }
    });

    results.tests.push({
      test: 'API Key Validation',
      endpoint: testEndpoint,
      status: response.status,
      success: response.status === 200,
      apiKeyStatus: response.status === 200 ? 'Valid' : response.status === 401 ? 'Invalid' : 'Unknown'
    });
    
  } catch (error) {
    results.tests.push({
      test: 'API Key Validation',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return NextResponse.json(results, { 
    headers: { 
      'Content-Type': 'application/json' 
    } 
  });
}