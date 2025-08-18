// Script temporal para obtener el FID de @Like2Win
// Ejecutar con: node scripts/get-like2win-fid.js

const { NeynarAPIClient } = require('@neynar/nodejs-sdk');

async function getLike2WinFID() {
  try {
    // Reemplaza con tu Neynar API key
    const client = new NeynarAPIClient({
      apiKey: process.env.NEYNAR_API_KEY || 'DEMO_API_KEY'
    });

    console.log('🔍 Buscando usuario @Like2Win...');
    
    const userResponse = await client.searchUser({ 
      q: 'Like2Win', 
      limit: 10 
    });

    if (!userResponse.result.users || userResponse.result.users.length === 0) {
      console.log('❌ Usuario @Like2Win no encontrado');
      return;
    }

    console.log('\n📋 Usuarios encontrados:');
    userResponse.result.users.forEach((user, index) => {
      console.log(`${index + 1}. @${user.username} (FID: ${user.fid})`);
      console.log(`   Display Name: ${user.display_name}`);
      console.log(`   Followers: ${user.follower_count || 0}`);
      console.log('');
    });

    // Buscar específicamente @Like2Win
    const like2winUser = userResponse.result.users.find(
      user => user.username.toLowerCase() === 'like2win'
    );

    if (like2winUser) {
      console.log('✅ Usuario oficial @Like2Win encontrado:');
      console.log(`   FID: ${like2winUser.fid}`);
      console.log(`   Username: @${like2winUser.username}`);
      console.log(`   Display Name: ${like2winUser.display_name}`);
      console.log(`   Followers: ${like2winUser.follower_count || 0}`);
      
      console.log('\n🔧 Agrega esta variable a tu .env.local:');
      console.log(`LIKE2WIN_FID=${like2winUser.fid}`);
    } else {
      console.log('⚠️  Usuario exacto @Like2Win no encontrado. Verifica el username.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('API key')) {
      console.log('\n💡 Necesitas configurar tu NEYNAR_API_KEY en .env.local');
      console.log('   Ve a: https://neynar.com/ para obtener una gratis');
    }
  }
}

getLike2WinFID();