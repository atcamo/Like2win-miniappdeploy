// Monitorear actividad del webhook en tiempo real
require('dotenv').config({ path: '.env.local' });

async function monitorWebhookActivity() {
    console.log('🔍 MONITOREANDO ACTIVIDAD DEL WEBHOOK');
    console.log('='.repeat(50));

    const WEBHOOK_URL = 'https://like2win-app.vercel.app';

    try {
        // 1. Obtener post más reciente
        console.log('1️⃣ Obteniendo post más reciente de @Like2Win...');

        const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
        const castsResponse = await fetch('https://api.neynar.com/v2/farcaster/feed/user/casts?fid=1206612&limit=1', {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        const castsData = await castsResponse.json();
        const latestPost = castsData.casts[0];

        console.log('✅ Post más reciente:');
        console.log(`   Hash: ${latestPost.hash}`);
        console.log(`   Texto: "${latestPost.text.substring(0, 50)}..."`);
        console.log(`   URL: https://warpcast.com/@like2win/${latestPost.hash}`);
        console.log('');

        // 2. Verificar logs del webhook ANTES
        console.log('2️⃣ Verificando logs del webhook (estado inicial)...');
        const initialLogsResponse = await fetch(`${WEBHOOK_URL}/api/debug/webhook-logs`);
        const initialLogs = await initialLogsResponse.json();

        console.log(`📊 Logs iniciales: ${initialLogs.totalLogs} total`);
        console.log(`   - Última hora: ${initialLogs.summary.lastHour}`);
        console.log(`   - Último minuto: ${initialLogs.summary.lastMinute}`);

        if (initialLogs.logs.length > 0) {
            console.log('   Último evento:', initialLogs.logs[0].timestamp);
        }
        console.log('');

        // 3. Instrucciones para prueba manual
        console.log('3️⃣ PRUEBA MANUAL:');
        console.log('🎯 Ve a Farcaster y dale LIKE al post:');
        console.log(`   "${latestPost.text.substring(0, 50)}..."`);
        console.log('');
        console.log('⏱️ Monitoreando cambios cada 5 segundos...');
        console.log('   (Presiona Ctrl+C para detener)');
        console.log('');

        // 4. Monitorear cambios cada 5 segundos
        let previousLogCount = initialLogs.totalLogs;

        setInterval(async () => {
            try {
                const currentLogsResponse = await fetch(`${WEBHOOK_URL}/api/debug/webhook-logs`);
                const currentLogs = await currentLogsResponse.json();

                if (currentLogs.totalLogs > previousLogCount) {
                    console.log(`🚨 NUEVO EVENTO DETECTADO! Total logs: ${currentLogs.totalLogs}`);

                    // Mostrar nuevos eventos
                    const newEvents = currentLogs.logs.slice(0, currentLogs.totalLogs - previousLogCount);
                    newEvents.forEach((event, index) => {
                        console.log(`\n📨 Evento ${index + 1}:`);
                        console.log(`   Timestamp: ${event.timestamp}`);
                        console.log(`   Headers:`, Object.keys(event.headers));
                        console.log(`   Body:`, event.body);
                    });

                    previousLogCount = currentLogs.totalLogs;
                } else {
                    // Mostrar punto para indicar que está monitoreando
                    process.stdout.write('.');
                }
            } catch (error) {
                console.log(`\n❌ Error monitoreando: ${error.message}`);
            }
        }, 5000);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

monitorWebhookActivity();