// Test directo del API de Neynar para encontrar el endpoint correcto
require('dotenv').config({ path: '.env.local' });

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const testHash = '0x4429321a2723b4b67b9bbe33af136ffa0f32a289';

console.log('🧪 Testing Neynar API endpoints directly...');

if (!NEYNAR_API_KEY) {
  console.log('❌ NEYNAR_API_KEY not found');
  process.exit(1);
}

async function testEndpoint(name, url) {
  try {
    console.log(`\n🔍 ${name}:`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS!`);
      console.log(`Response keys: ${Object.keys(data).join(', ')}`);
      
      if (data.reactions) {
        console.log(`Reactions found: ${JSON.stringify(data.reactions, null, 2)}`);
      } else if (data.likes) {
        console.log(`Likes found: ${data.likes.length}`);
      } else {
        console.log(`Data structure: ${JSON.stringify(data, null, 2)}`);
      }
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  const tests = [
    // Try other possible endpoints based on documentation patterns
    ['reactions-cast endpoint', `https://api.neynar.com/v2/farcaster/reactions-cast?hash=${testHash}&types=likes&limit=10`],
    ['cast-reactions endpoint', `https://api.neynar.com/v2/farcaster/cast-reactions?hash=${testHash}&types=likes&limit=10`],
    ['reactions/cast endpoint', `https://api.neynar.com/v2/farcaster/reactions/cast?hash=${testHash}&types=likes&limit=10`],
    ['cast/{hash}/reactions', `https://api.neynar.com/v2/farcaster/cast/${testHash}/reactions?types=likes&limit=10`],
    ['cast/{hash}/reactions/', `https://api.neynar.com/v2/farcaster/cast/${testHash}/reactions/?types=likes&limit=10`],
    ['reactions by target URL', `https://api.neynar.com/v2/farcaster/reactions?target_url=https://warpcast.com/like2win/${testHash.substring(2)}&types=likes&limit=10`],
    // Try V1 endpoints (deprecated but might work)
    ['v1 reactions endpoint', `https://api.neynar.com/v1/farcaster/reactions?hash=${testHash}&types=likes&limit=10`],
    ['hub-api reactions', `https://hub-api.neynar.com/v2/farcaster/cast/reactions?hash=${testHash}&types=likes&limit=10`]
  ];

  console.log(`Testing with hash: ${testHash}`);
  
  let workingEndpoint = null;
  
  for (const [name, url] of tests) {
    const result = await testEndpoint(name, url);
    if (result.success) {
      workingEndpoint = url;
      console.log(`\n🎉 WORKING ENDPOINT FOUND: ${url}`);
      break;
    }
  }
  
  if (!workingEndpoint) {
    console.log('\n❌ No working endpoint found. All tests failed.');
  }
}

main().catch(console.error);