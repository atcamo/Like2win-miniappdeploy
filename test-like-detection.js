// Test de detección de likes en tiempo real
require('dotenv').config({ path: '.env.local' });

async function testLikeDetection() {
    console.log('🎯 TEST DE DETECCIÓN DE LIKES AUTOMÁTICA');
    console.log('='.repeat(50));
    
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    
    if (!NEYNAR_API_KEY) {
        console.log('❌ No NEYNAR_API_KEY found');
        return;
    }

    // 1. Obtener post más reciente
    console.log('1️⃣ Obteniendo post más reciente de @Like2Win...');
    
    try {
        const castsResponse = await fetch('https://api.neynar.com/v2/farcaster/feed/user/casts?fid=1206612&limit=1', {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        if (!castsResponse.ok) {
            console.log('❌ Error obteniendo posts');
            return;
        }

        const castsData = await castsResponse.json();
        const latestPost = castsData.casts[0];
        
        console.log('✅ Post encontrado:');
        console.log(`   Hash: ${latestPost.hash}`);
        console.log(`   Texto: "${latestPost.text.substring(0, 50)}..."`);
        console.log(`   Likes: ${latestPost.reactions?.likes?.length || 0}`);
        console.log('');

        // 2. Obtener likes del post
        console.log('2️⃣ Verificando likes actuales...');
        
        const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast?identifier=${latestPost.hash}&type=hash`, {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        if (reactionsResponse.ok) {
            const reactionData = await reactionsResponse.json();
            const likes = reactionData.cast?.reactions?.likes || [];
            
            console.log(`✅ Likes actuales: ${likes.length}`);
            if (likes.length > 0) {
                console.log('   Últimos que dieron like:');
                likes.slice(-3).forEach(like => {
                    console.log(`   - @${like.user.username} (FID: ${like.user.fid})`);
                });
            }
        }
        
        console.log('');
        console.log('3️⃣ PRUEBA MANUAL:');
        console.log('📱 Ve a Farcaster y dale LIKE a este post:');
        console.log(`   "${latestPost.text.substring(0, 50)}..."`);
        console.log('');
        console.log('⏱️ Esperando 30 segundos para detectar el nuevo like...');
        
        // Esperar 30 segundos
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // 3. Verificar si hay nuevos likes
        console.log('');
        console.log('4️⃣ Verificando nuevos likes...');
        
        const newReactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast?identifier=${latestPost.hash}&type=hash`, {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        if (newReactionsResponse.ok) {
            const newReactionData = await newReactionsResponse.json();
            const newLikes = newReactionData.cast?.reactions?.likes || [];
            
            console.log(`🔍 Likes después de prueba: ${newLikes.length}`);
            
            if (newLikes.length > likes.length) {
                console.log('🎉 ¡NUEVO LIKE DETECTADO!');
                const newestLikes = newLikes.slice(-(newLikes.length - likes.length));
                newestLikes.forEach(like => {
                    console.log(`   👤 @${like.user.username} (FID: ${like.user.fid}) acaba de dar like`);
                });
                
                console.log('');
                console.log('5️⃣ IMPORTANTE: Verificar si llegó via webhook...');
                console.log('   Revisa logs de Vercel para ver si se procesó automáticamente');
                
            } else {
                console.log('⚠️ No se detectaron nuevos likes');
                console.log('   Esto puede significar:');
                console.log('   - No diste like al post');
                console.log('   - El webhook no está funcionando');
                console.log('   - Hay un problema con la configuración');
            }
        }
        
        console.log('');
        console.log('✅ Test completado');
        console.log('📊 Próximo paso: revisar logs de Vercel');

    } catch (error) {
        console.error('❌ Error en test:', error);
    }
}

testLikeDetection();