// Verificar si el webhook está recibiendo eventos
require('dotenv').config({ path: '.env.local' });

async function checkWebhookActivity() {
    console.log('🔍 VERIFICANDO ACTIVIDAD DEL WEBHOOK');
    console.log('='.repeat(40));

    try {
        // 1. Verificar endpoint del webhook
        console.log('1️⃣ Verificando endpoint...');
        const endpointResponse = await fetch('https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar');
        
        if (endpointResponse.ok) {
            const data = await endpointResponse.json();
            console.log('✅ Endpoint activo:', data.name);
        } else {
            console.log('❌ Problema con endpoint:', endpointResponse.status);
        }

        // 2. Verificar base de datos por actividad reciente
        console.log('\n2️⃣ Verificando actividad en base de datos...');
        const dbResponse = await fetch('https://like2win-miniappdeploy.vercel.app/api/admin/debug-data');
        
        if (dbResponse.ok) {
            const dbData = await dbResponse.json();
            
            // Verificar engagement logs
            const engagementLogs = dbData.engagementLogs?.list || [];
            console.log(`📊 Total engagement logs: ${engagementLogs.length}`);
            
            if (engagementLogs.length > 0) {
                console.log('   Últimos 3 logs:');
                engagementLogs.slice(-3).forEach((log, i) => {
                    console.log(`   ${i+1}. FID ${log.userFid} - ${log.hasLiked ? '👍 Liked' : '❌ No like'} - ${log.createdAt}`);
                });
            }
            
            // Verificar tickets
            const tickets = dbData.userTickets?.list || [];
            console.log(`🎫 Total user tickets: ${tickets.length}`);
            
            if (tickets.length > 0) {
                console.log('   Top usuarios con tickets:');
                tickets.slice(0, 5).forEach((ticket, i) => {
                    console.log(`   ${i+1}. FID ${ticket.userFid}: ${ticket.ticketsCount} tickets`);
                });
            }

        } else {
            console.log('❌ Error verificando base de datos');
        }

        // 3. Verificar configuración del webhook en Neynar
        console.log('\n3️⃣ Verificando webhook en Neynar...');
        const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
        
        if (NEYNAR_API_KEY) {
            const webhooksResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook', {
                headers: {
                    'accept': 'application/json',
                    'api_key': NEYNAR_API_KEY
                }
            });

            if (webhooksResponse.ok) {
                const webhooksData = await webhooksResponse.json();
                const webhooks = webhooksData.webhooks || [];
                console.log(`🔗 Webhooks configurados: ${webhooks.length}`);
                
                const like2winWebhook = webhooks.find(w => 
                    w.target_url?.includes('like2win-miniappdeploy.vercel.app')
                );
                
                if (like2winWebhook) {
                    console.log('✅ Webhook Like2Win encontrado:');
                    console.log(`   - ID: ${like2winWebhook.webhook_id}`);
                    console.log(`   - Activo: ${like2winWebhook.active}`);
                    console.log(`   - URL: ${like2winWebhook.target_url}`);
                } else {
                    console.log('❌ No se encontró webhook de Like2Win');
                }
            }
        }

        console.log('\n📋 DIAGNÓSTICO FINAL:');
        if (engagementLogs.length === 0) {
            console.log('❌ NO se están recibiendo eventos del webhook');
            console.log('   Posibles causas:');
            console.log('   1. Webhook no está enviando eventos desde Neynar');
            console.log('   2. Los filtros del webhook están mal configurados');
            console.log('   3. No hay likes reales de otros usuarios');
        } else {
            console.log('✅ El webhook está funcionando');
            console.log('   Se están registrando eventos de engagement');
        }

    } catch (error) {
        console.error('❌ Error verificando webhook:', error);
    }
}

checkWebhookActivity();