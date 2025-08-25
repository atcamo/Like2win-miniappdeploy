// Test en vivo del webhook
require('dotenv').config({ path: '.env.local' });

async function testWebhookLive() {
    console.log('🧪 Probando webhook en tiempo real...');
    console.log('');
    console.log('📋 INSTRUCCIONES:');
    console.log('1. Ve a Farcaster');
    console.log('2. Busca un post reciente de @Like2Win (FID 1206612)');
    console.log('3. Dale LIKE al post');
    console.log('4. Observa la consola por 30 segundos');
    console.log('');
    console.log('⏱️ Esperando eventos...');
    
    // Verificar nuestro endpoint
    try {
        const response = await fetch('https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar', {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Endpoint funcionando:', data.name);
        } else {
            console.log('❌ Problema con endpoint:', response.status);
        }
    } catch (error) {
        console.log('❌ Error verificando endpoint:', error.message);
    }
    
    console.log('');
    console.log('🔍 Para verificar si llegó el evento, revisa:');
    console.log('- Logs de Vercel: https://vercel.com/dashboard');
    console.log('- O ejecuta: curl https://like2win-miniappdeploy.vercel.app/api/admin/debug-data');
    
    // Esperar 30 segundos
    console.log('');
    console.log('⏳ Esperando 30 segundos para eventos...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('✅ Test completado. Revisa los logs de Vercel para ver si llegaron eventos.');
}

testWebhookLive();