// Debug webhooks detallado
require('dotenv').config({ path: '.env.local' });

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

async function debugWebhooks() {
    console.log('🔍 DEBUG WEBHOOKS DETALLADO');
    console.log('='.repeat(50));

    if (!NEYNAR_API_KEY) {
        console.log('❌ NEYNAR_API_KEY no encontrada');
        return;
    }

    try {
        // 1. Listar todos los webhooks
        console.log('1️⃣ Listando todos los webhooks...');
        const listResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook/list', {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        if (!listResponse.ok) {
            console.log('❌ Error listando webhooks:', listResponse.status);
            const errorText = await listResponse.text();
            console.log('Error details:', errorText);
            return;
        }

        const webhookData = await listResponse.json();
        const webhooks = webhookData.webhooks || [];

        console.log(`✅ Encontrados ${webhooks.length} webhooks:`);
        webhooks.forEach((webhook, index) => {
            console.log(`\n${index + 1}. ${webhook.name || 'Sin nombre'}`);
            console.log(`   ID: ${webhook.webhook_id}`);
            console.log(`   URL: ${webhook.url}`);
            console.log(`   Activo: ${webhook.is_active}`);
            console.log(`   Eventos: ${Object.keys(webhook.subscription || {}).join(', ')}`);

            // Verificar si es nuestro webhook
            if (webhook.url?.includes('like2win-app.vercel.app')) {
                console.log(`   🎯 ESTE ES NUESTRO WEBHOOK CORRECTO`);
            } else if (webhook.url?.includes('like2win')) {
                console.log(`   ⚠️ Este es un webhook Like2Win con URL incorrecta`);
            }
        });

        // 2. Verificar webhook específico para Like2Win
        const correctWebhook = webhooks.find(w => w.url?.includes('like2win-app.vercel.app'));

        if (correctWebhook) {
            console.log('\n2️⃣ Verificando webhook correcto...');
            console.log(`✅ Webhook encontrado: ${correctWebhook.webhook_id}`);
            console.log(`   Eventos configurados:`);

            Object.entries(correctWebhook.subscription || {}).forEach(([event, config]) => {
                console.log(`   - ${event}:`, config);
            });

            // Test del webhook
            console.log('\n3️⃣ Probando endpoint del webhook...');
            const testResponse = await fetch(correctWebhook.url, {
                method: 'GET'
            });

            if (testResponse.ok) {
                const testData = await testResponse.json();
                console.log('✅ Webhook endpoint funciona:');
                console.log(`   Nombre: ${testData.name}`);
                console.log(`   Estado: ${testData.status}`);
            } else {
                console.log(`❌ Webhook endpoint no responde: ${testResponse.status}`);
            }

        } else {
            console.log('\n❌ No se encontró webhook con URL correcta');
            console.log('🔧 Necesita crearse un webhook nuevo');
        }

        // 3. Verificar si hay webhooks antiguos a eliminar
        const oldWebhooks = webhooks.filter(w =>
            w.url?.includes('like2win-miniappdeploy') ||
            (w.url?.includes('like2win') && !w.url?.includes('like2win-app.vercel.app'))
        );

        if (oldWebhooks.length > 0) {
            console.log('\n4️⃣ Webhooks antiguos encontrados para eliminar:');
            oldWebhooks.forEach(webhook => {
                console.log(`   🗑️ ${webhook.webhook_id} - ${webhook.url}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugWebhooks();