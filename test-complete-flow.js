// Test completo del flujo de detección de likes
require('dotenv').config({ path: '.env.local' });

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

console.log('🔍 Testing complete Like2Win flow...');

async function main() {
  // 1. Obtener posts de @Like2Win
  console.log('\n📱 Step 1: Fetching @Like2Win posts...');
  
  const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=1206612&limit=5`, {
    headers: {
      'accept': 'application/json',
      'api_key': NEYNAR_API_KEY
    }
  });

  if (!castsResponse.ok) {
    throw new Error(`Failed to fetch posts: ${castsResponse.status}`);
  }

  const castsData = await castsResponse.json();
  const posts = castsData.casts || [];
  
  console.log(`✅ Found ${posts.length} posts from @Like2Win`);
  
  let totalLikes = 0;
  const usersWhoLiked = new Set();
  
  // 2. Para cada post, obtener likes usando el endpoint correcto
  for (const post of posts) {
    console.log(`\n🔍 Post: ${post.hash}`);
    console.log(`📝 Content: "${post.text.substring(0, 50)}..."`);
    console.log(`📊 Feed shows: ${post.reactions?.likes_count || 0} likes`);
    
    // Usar el endpoint CORRECTO que encontramos
    const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/reactions/cast?hash=${post.hash}&types=likes&limit=100`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    if (!reactionsResponse.ok) {
      console.log(`❌ Failed to get reactions: ${reactionsResponse.status}`);
      continue;
    }

    const reactionsData = await reactionsResponse.json();
    const likes = reactionsData.reactions || [];
    
    console.log(`❤️ API shows: ${likes.length} likes`);
    
    if (likes.length > 0) {
      console.log('👥 Users who liked:');
      likes.forEach((like, i) => {
        console.log(`  ${i+1}. ${like.user.username} (FID: ${like.user.fid}) - ${like.reaction_timestamp}`);
        usersWhoLiked.add(`${like.user.username} (${like.user.fid})`);
      });
    }
    
    totalLikes += likes.length;
    
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 3. Resumen final
  console.log('\n📊 SUMMARY:');
  console.log(`Posts analyzed: ${posts.length}`);
  console.log(`Total likes found: ${totalLikes}`);
  console.log(`Unique users who liked: ${usersWhoLiked.size}`);
  
  if (usersWhoLiked.size > 0) {
    console.log('\n👥 All users who gave likes:');
    Array.from(usersWhoLiked).forEach((user, i) => {
      console.log(`  ${i+1}. ${user}`);
    });
  }
  
  // 4. Verificar si incluye usuarios específicos
  const targetUsers = ['itsai', 'zahoorahmed', 'atcamo'];
  console.log('\n🎯 Checking for target users:');
  
  targetUsers.forEach(targetUser => {
    const found = Array.from(usersWhoLiked).some(user => user.toLowerCase().includes(targetUser.toLowerCase()));
    console.log(`  ${targetUser}: ${found ? '✅ FOUND' : '❌ Not found'}`);
  });
  
  console.log('\n🎉 Test completed!');
}

main().catch(console.error);