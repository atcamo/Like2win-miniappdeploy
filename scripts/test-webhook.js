// Test webhook después de configurar en Neynar
async function testWebhookSetup() {
    console.log('🧪 Testing Webhook Configuration');
    console.log('===============================\n');

    const webhookUrl = 'https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar';
    
    // 1. Test webhook endpoint
    console.log('1️⃣ Testing webhook endpoint...');
    try {
        const response = await fetch(webhookUrl);
        const data = await response.json();
        console.log('✅ Webhook endpoint active:', data.status);
        console.log('Supported events:', data.supportedEvents);
    } catch (error) {
        console.log('❌ Webhook endpoint error:', error.message);
    }

    // 2. Test engagement processor
    console.log('\n2️⃣ Testing engagement processor...');
    try {
        const response = await fetch('https://like2win-miniappdeploy.vercel.app/api/engagement/process');
        const data = await response.json();
        console.log('✅ Engagement processor active');
        console.log('Current raffle:', data.currentRaffle?.weekPeriod);
    } catch (error) {
        console.log('❌ Engagement processor error:', error.message);
    }

    // 3. Instructions for final testing
    console.log('\n3️⃣ Manual Testing Instructions:');
    console.log('=====================================');
    console.log('Para probar que el webhook funciona:');
    console.log('');
    console.log('1. 📱 Publica un post desde @Like2Win (FID 1206612)');
    console.log('2. 👍 Dale like a ese post desde otra cuenta');
    console.log('3. 🔍 Verifica tickets en: https://like2win-miniappdeploy.vercel.app/miniapp/simple');
    console.log('');
    console.log('🎯 Si el webhook está configurado correctamente,');
    console.log('   los likes deberían aparecer automáticamente como tickets.');
}

testWebhookSetup().catch(console.error);