const fetch = require('node-fetch');

async function debugFollowDetection() {
  const API_KEY = '16DCDDEB-2CA4-458E-8247-31D28B418490';
  const USER_FID = 432789;
  const LIKE2WIN_FID = 1206612;
  
  console.log('🔍 DEBUG: Follow Detection for FID', USER_FID);
  console.log('🎯 Target: @Like2Win FID', LIKE2WIN_FID);
  console.log('');

  try {
    // Test 1: Get user info
    console.log('📍 Test 1: Getting user info...');
    const userResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${USER_FID}`, {
      headers: {
        'Accept': 'application/json',
        'api_key': API_KEY
      }
    });
    
    if (!userResponse.ok) {
      throw new Error(`User API Error: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    const user = userData.users[0];
    
    console.log(`✅ User Found: @${user.username} (${user.display_name})`);
    console.log(`   Following Count: ${user.following_count}`);
    console.log(`   Follower Count: ${user.follower_count}`);
    console.log('');

    // Test 2: Get following list with different limits
    console.log('📍 Test 2: Checking following list...');
    
    for (const limit of [100, 500, 1000]) {
      console.log(`   Checking first ${limit} follows...`);
      
      const followingResponse = await fetch(`https://api.neynar.com/v2/farcaster/following?fid=${USER_FID}&limit=${limit}`, {
        headers: {
          'Accept': 'application/json',
          'api_key': API_KEY
        }
      });
      
      if (!followingResponse.ok) {
        console.log(`   ❌ Error with limit ${limit}: ${followingResponse.status}`);
        continue;
      }
      
      const followingData = await followingResponse.json();
      const isFollowing = followingData.users.some(user => user.fid === LIKE2WIN_FID);
      
      console.log(`   ${isFollowing ? '✅' : '❌'} Found @Like2Win in first ${limit} follows`);
      
      if (isFollowing) {
        const like2winUser = followingData.users.find(user => user.fid === LIKE2WIN_FID);
        console.log(`   📍 @Like2Win found: @${like2winUser.username} (${like2winUser.display_name})`);
        break;
      }
    }
    
    console.log('');

    // Test 3: Reverse check - who follows Like2Win
    console.log('📍 Test 3: Reverse check - Like2Win followers...');
    
    const followersResponse = await fetch(`https://api.neynar.com/v2/farcaster/followers?fid=${LIKE2WIN_FID}&limit=1000`, {
      headers: {
        'Accept': 'application/json',
        'api_key': API_KEY
      }
    });
    
    if (followersResponse.ok) {
      const followersData = await followersResponse.json();
      const isFollower = followersData.users.some(user => user.fid === USER_FID);
      
      console.log(`   ${isFollower ? '✅' : '❌'} FID ${USER_FID} found in @Like2Win followers`);
      
      if (isFollower) {
        const followerUser = followersData.users.find(user => user.fid === USER_FID);
        console.log(`   📍 Follower found: @${followerUser.username} (${followerUser.display_name})`);
      }
    } else {
      console.log(`   ❌ Error checking followers: ${followersResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Debug Error:', error.message);
  }
}

debugFollowDetection();