#!/usr/bin/env node

// Simple test script to verify Neynar integration without database
const { NeynarAPIClient, Configuration } = require('@neynar/nodejs-sdk');

async function testNeynarIntegration() {
  try {
    console.log('🧪 Testing Neynar API integration...');
    
    const apiKey = process.env.NEYNAR_API_KEY;
    const like2winFid = parseInt(process.env.LIKE2WIN_FID || '1206612');
    
    if (!apiKey) {
      console.error('❌ NEYNAR_API_KEY not found');
      return;
    }
    
    console.log(`✅ API Key found: ${apiKey.substring(0, 8)}...`);
    console.log(`✅ Like2Win FID: ${like2winFid}`);
    
    // Initialize client
    const config = new Configuration({
      apiKey: apiKey,
      baseOptions: {
        headers: {
          'x-neynar-experimental': true,
        },
      },
    });
    
    const client = new NeynarAPIClient(config);
    console.log('✅ Neynar client initialized');
    
    // Test 1: Get Like2Win user info
    console.log('\n📋 Test 1: Get Like2Win user info');
    try {
      const userResponse = await client.fetchBulkUsers({ fids: [like2winFid] });
      const user = userResponse.users[0];
      
      if (user) {
        console.log(`✅ User found: @${user.username} (${user.display_name})`);
        console.log(`   - Followers: ${user.follower_count}`);
        console.log(`   - Following: ${user.following_count}`);
        console.log(`   - Power Badge: ${user.power_badge ? 'Yes' : 'No'}`);
      } else {
        console.log('❌ User not found');
      }
    } catch (error) {
      console.log(`❌ User fetch failed: ${error.message}`);
    }
    
    // Test 2: Get Like2Win recent casts
    console.log('\n📋 Test 2: Get Like2Win recent casts');
    try {
      const castsResponse = await client.fetchCastsForUser({
        fid: like2winFid,
        limit: 3
      });
      
      if (castsResponse.casts && castsResponse.casts.length > 0) {
        console.log(`✅ Found ${castsResponse.casts.length} recent casts:`);
        castsResponse.casts.forEach((cast, index) => {
          const text = cast.text.length > 80 ? cast.text.substring(0, 80) + '...' : cast.text;
          console.log(`   ${index + 1}. ${text}`);
          console.log(`      Hash: ${cast.hash}`);
          console.log(`      Likes: ${cast.reactions?.likes_count || 0}`);
        });
      } else {
        console.log('❌ No casts found');
      }
    } catch (error) {
      console.log(`❌ Casts fetch failed: ${error.message}`);
    }
    
    // Test 3: Test cast lookup (if we have a hash)
    console.log('\n📋 Test 3: Test cast lookup');
    try {
      const castsResponse = await client.fetchCastsForUser({
        fid: like2winFid,
        limit: 1
      });
      
      if (castsResponse.casts && castsResponse.casts.length > 0) {
        const castHash = castsResponse.casts[0].hash;
        console.log(`Testing cast lookup for: ${castHash}`);
        
        const castResponse = await client.lookUpCastByHashOrWarpcastUrl({ 
          identifier: castHash,
          type: 'hash'
        });
        
        if (castResponse.cast) {
          console.log(`✅ Cast lookup successful`);
          console.log(`   - Author: @${castResponse.cast.author.username}`);
          console.log(`   - Likes: ${castResponse.cast.reactions?.likes_count || 0}`);
          console.log(`   - Recasts: ${castResponse.cast.reactions?.recasts_count || 0}`);
        }
      }
    } catch (error) {
      console.log(`❌ Cast lookup failed: ${error.message}`);
    }
    
    // Test 4: Check rate limits
    console.log('\n📋 Test 4: Rate limit info');
    console.log('ℹ️  If you see 402 errors, you may need to upgrade your Neynar plan');
    console.log('ℹ️  Free plan has limited access to some endpoints');
    
    console.log('\n🎉 Neynar integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config({ path: '.env.local' });
  testNeynarIntegration();
}

module.exports = { testNeynarIntegration };