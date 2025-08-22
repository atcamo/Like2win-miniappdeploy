// Script para verificar que Neynar está configurado correctamente
async function verifyNeynarSetup() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    console.log('🔍 Verificando configuración de Neynar...\n');
    
    // Test our webhook endpoint
    console.log('1️⃣ Verificando que nuestro endpoint funcione...');
    try {
        const webhookResponse = await fetch(`${baseUrl}/api/webhooks/neynar`);
        const webhookData = await webhookResponse.json();
        
        console.log('   ✅ Webhook endpoint activo');
        console.log('   📊 Info:', webhookData.name);
        console.log('   🔗 URL:', webhookData.webhookUrl);
        
    } catch (error) {
        console.log('   ❌ Error con webhook endpoint:', error.message);
    }
    
    // Show configuration details
    console.log('\n2️⃣ Configuración requerida para Neynar:');
    console.log('==================================================');
    console.log('🔗 Target URL:');
    console.log('   https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar');
    console.log('');
    console.log('📋 Event Type:');
    console.log('   reaction.created');
    console.log('');
    console.log('🎯 Filtros necesarios:');
    console.log('   cast.author.fid: 1206612 (Like2Win oficial)');
    console.log('   reaction.type: like (opcional, pero recomendado)');
    console.log('');
    console.log('📝 JSON de filtro (copia esto en Neynar):');
    console.log(JSON.stringify({
        "cast.author.fid": 1206612,
        "reaction.type": "like"
    }, null, 2));
    
    console.log('\n3️⃣ Pasos en el Dashboard de Neynar:');
    console.log('1. Ve a: https://dev.neynar.com/webhook');
    console.log('2. Click "New Webhook"');
    console.log('3. Name: "Like2Win Engagement Tracker"');
    console.log('4. Target URL: (la URL de arriba)');
    console.log('5. Event: "reaction.created"');
    console.log('6. Filters: (el JSON de arriba)');
    console.log('7. Save webhook');
    
    console.log('\n4️⃣ Cómo probar:');
    console.log('1. Guarda el webhook en Neynar');
    console.log('2. Ve a https://warpcast.com/like2win');
    console.log('3. Da like a cualquier post');
    console.log('4. Espera 10-30 segundos');
    console.log('5. Verifica tickets en tu MiniApp');
    
    console.log('\n5️⃣ Si necesitas API key en el código:');
    if (process.env.NEYNAR_API_KEY) {
        console.log('   ✅ NEYNAR_API_KEY está configurada');
    } else {
        console.log('   ⚠️  NEYNAR_API_KEY no está configurada');
        console.log('   📝 Agregar a Vercel env vars si es necesario');
    }
    
    console.log('\n🎯 Una vez configurado, los likes automáticos deberían funcionar!');
}

verifyNeynarSetup();