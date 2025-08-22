// Verificar posts oficiales de @Like2Win para dar like
async function checkOfficialPosts() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    console.log('🔍 Verificando posts oficiales de @Like2Win...\n');
    
    try {
        // Check if we can get Like2Win casts via our engagement system
        console.log('1️⃣ Intentando obtener posts oficiales...');
        
        // Try the engagement endpoint that loads casts
        const engagementResponse = await fetch(`${baseUrl}/api/engagement/casts?limit=3`);
        
        if (engagementResponse.ok) {
            const castsData = await engagementResponse.json();
            console.log('   Posts oficiales encontrados:', castsData.casts?.length || 0);
            
            if (castsData.casts && castsData.casts.length > 0) {
                console.log('\n📋 Posts oficiales recientes:');
                castsData.casts.forEach((cast, index) => {
                    console.log(`   ${index + 1}. Hash: ${cast.hash}`);
                    console.log(`      Autor: @${cast.author.username} (FID: ${cast.author.fid})`);
                    console.log(`      Texto: ${cast.text.substring(0, 100)}...`);
                    console.log(`      Likes: ${cast.engagement.likes}`);
                    console.log(`      URL: https://warpcast.com/like2win/${cast.hash}\n`);
                });
                
                console.log('💡 RECOMENDACIÓN:');
                console.log('   Para obtener tickets automáticos, da like a estos posts ☝️');
                console.log('   Son los posts oficiales de @Like2Win (FID 1206612)');
                
            } else {
                console.log('   ❌ No se encontraron posts oficiales');
            }
        } else {
            console.log('   ❌ No se pudo obtener posts oficiales');
            console.log('   Status:', engagementResponse.status);
        }
        
        // Alternative: Check if we have any engagement logs for this FID
        console.log('\n2️⃣ Verificando si hay logs de engagement...');
        console.log('   (Los logs mostrarían si el webhook detectó el like)');
        
        // Show webhook info
        console.log('\n3️⃣ Info del webhook:');
        console.log('   URL: https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar');
        console.log('   Eventos: reaction.created (likes, recasts)');
        console.log('   Target: Posts de @like2win (FID 1206612)');
        
        console.log('\n4️⃣ SIGUIENTE PASO:');
        console.log('   🎯 Da like a uno de los posts oficiales listados arriba');
        console.log('   ⏱️  Espera ~30 segundos'); 
        console.log('   🔄 Verifica si aparece el ticket automáticamente');
        console.log('   📱 URL para Like2Win: https://warpcast.com/like2win');
        
    } catch (error) {
        console.error('❌ Error verificando posts:', error);
    }
}

checkOfficialPosts();