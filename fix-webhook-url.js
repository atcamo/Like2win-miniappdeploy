// Corregir URL del webhook de Neynar
require('dotenv').config({ path: '.env.local' });

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const OLD_WEBHOOK_URL = 'https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar';
const NEW_WEBHOOK_URL = 'https://like2win-app.vercel.app/api/webhooks/neynar';
const LIKE2WIN_FID = 1206612;

async function fixWebhookURL() {
    console.log('🔧 CORRIGIENDO URL DEL WEBHOOK');
    console.log('='.repeat(40));

    if (!NEYNAR_API_KEY) {
        console.log('❌ NEYNAR_API_KEY no encontrada');
        return;
    }

    try {
        // 1. Listar webhooks existentes
        console.log('1️⃣ Buscando webhooks existentes...');
        const listResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook/list', {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        if (!listResponse.ok) {
            console.log('❌ Error listando webhooks:', listResponse.status);
            return;
        }

        const webhookData = await listResponse.json();
        const webhooks = webhookData.webhooks || [];

        console.log(`📋 Encontrados ${webhooks.length} webhooks`);

        // 2. Encontrar webhook con URL incorrecta
        const oldWebhook = webhooks.find(w =>
            w.url === OLD_WEBHOOK_URL ||
            w.url?.includes('like2win-miniappdeploy')
        );

        if (oldWebhook) {
            console.log('🎯 Webhook con URL incorrecta encontrado:');
            console.log(`   ID: ${oldWebhook.webhook_id}`);
            console.log(`   URL: ${oldWebhook.url}`);

            // 3. Eliminar webhook incorrecto
            console.log('🗑️ Eliminando webhook incorrecto...');
            const deleteResponse = await fetch(`https://api.neynar.com/v2/farcaster/webhook?webhook_id=${oldWebhook.webhook_id}`, {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json',
                    'api_key': NEYNAR_API_KEY
                }
            });

            if (deleteResponse.ok) {
                console.log('✅ Webhook incorrecto eliminado');
            } else {
                console.log('❌ Error eliminando webhook:', deleteResponse.status);
                return;
            }
        } else {
            console.log('ℹ️ No se encontró webhook con URL incorrecta');
        }

        // 4. Verificar si ya existe webhook correcto
        const correctWebhook = webhooks.find(w => w.url === NEW_WEBHOOK_URL);

        if (correctWebhook) {
            console.log('✅ Ya existe webhook con URL correcta:');
            console.log(`   ID: ${correctWebhook.webhook_id}`);
            console.log(`   URL: ${correctWebhook.url}`);
            return;
        }

        // 5. Crear nuevo webhook con URL correcta
        console.log('🆕 Creando webhook con URL correcta...');
        const createResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Like2Win Engagement Tracker',
                url: NEW_WEBHOOK_URL,
                subscription: {
                    'reaction.created': {
                        cast_author_fids: [LIKE2WIN_FID]
                    }
                }
            })
        });

        const result = await createResponse.json();

        if (createResponse.ok) {
            console.log('✅ Nuevo webhook configurado exitosamente!');
            console.log(`   ID: ${result.webhook_id}`);
            console.log(`   URL: ${NEW_WEBHOOK_URL}`);
            console.log('');
            console.log('🎯 El sistema ahora detectará likes en posts del FID', LIKE2WIN_FID);
            console.log('');
            console.log('🧪 PRUEBA:');
            console.log('1. Ve a Farcaster');
            console.log('2. Dale like a un post de @Like2Win');
            console.log('3. El webhook debería procesar automáticamente');
        } else {
            console.log('❌ Error creando webhook:', result);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixWebhookURL();