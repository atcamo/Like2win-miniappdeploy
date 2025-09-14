// Crear webhook usando la API correcta de Neynar
require('dotenv').config({ path: '.env.local' });

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const WEBHOOK_URL = 'https://like2win-app.vercel.app/api/webhooks/neynar';
const LIKE2WIN_FID = 1206612;

async function createProperWebhook() {
    console.log('🔗 CREANDO WEBHOOK CORRECTO CON NEYNAR API V2');
    console.log('='.repeat(60));

    if (!NEYNAR_API_KEY) {
        console.log('❌ NEYNAR_API_KEY no encontrada');
        return;
    }

    try {
        // 1. Primero eliminar webhooks existentes si los hay
        console.log('1️⃣ Eliminando webhooks existentes...');

        const listResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook/list', {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        if (listResponse.ok) {
            const webhookData = await listResponse.json();
            const webhooks = webhookData.webhooks || [];

            console.log(`📋 Encontrados ${webhooks.length} webhooks existentes`);

            // Eliminar todos los webhooks existentes para empezar limpio
            for (const webhook of webhooks) {
                try {
                    const deleteResponse = await fetch(`https://api.neynar.com/v2/farcaster/webhook/${webhook.subscription_id}`, {
                        method: 'DELETE',
                        headers: {
                            'accept': 'application/json',
                            'api_key': NEYNAR_API_KEY
                        }
                    });

                    if (deleteResponse.ok) {
                        console.log(`🗑️ Eliminado webhook: ${webhook.subscription_id}`);
                    } else {
                        console.log(`⚠️ No se pudo eliminar webhook: ${webhook.subscription_id}`);
                    }
                } catch (error) {
                    console.log(`⚠️ Error eliminando webhook ${webhook.subscription_id}:`, error.message);
                }

                // Pausa entre eliminaciones
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log('\n2️⃣ Creando nuevo webhook...');

        // 2. Crear webhook nuevo con configuración correcta
        const webhookConfig = {
            name: 'Like2Win Engagement Tracker',
            url: WEBHOOK_URL,
            subscription: {
                'reaction.created': {
                    cast_author_fids: [LIKE2WIN_FID.toString()]
                }
            }
        };

        console.log('📤 Enviando configuración:');
        console.log(JSON.stringify(webhookConfig, null, 2));

        const createResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(webhookConfig)
        });

        const responseText = await createResponse.text();
        console.log(`\n📥 Respuesta HTTP: ${createResponse.status}`);
        console.log('📄 Respuesta completa:', responseText);

        if (createResponse.ok) {
            try {
                const result = JSON.parse(responseText);
                console.log('\n✅ Webhook creado exitosamente!');
                console.log(`   ID: ${result.subscription_id || result.webhook_id || 'ID no disponible'}`);
                console.log(`   URL: ${WEBHOOK_URL}`);
                console.log(`   Eventos: cast.reaction.created para FID ${LIKE2WIN_FID}`);

                console.log('\n🎯 AHORA EL SISTEMA DEBERÍA DETECTAR:');
                console.log('   - Likes en posts del FID 1206612 (@Like2Win)');
                console.log('   - Recasts en posts del FID 1206612');
                console.log('');
                console.log('🧪 PRUEBA:');
                console.log('1. Ve a Farcaster');
                console.log('2. Dale like a un post de @Like2Win');
                console.log('3. Verifica logs en Vercel');

            } catch (parseError) {
                console.log('⚠️ Respuesta recibida pero no es JSON válido');
            }
        } else {
            console.log('❌ Error creando webhook');
            console.log(`   Status: ${createResponse.status}`);
            console.log(`   Respuesta: ${responseText}`);
        }

        // 3. Verificar el webhook creado
        console.log('\n3️⃣ Verificando webhook final...');
        const finalListResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook/list', {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        if (finalListResponse.ok) {
            const finalData = await finalListResponse.json();
            console.log(`📋 Webhooks activos: ${finalData.webhooks?.length || 0}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createProperWebhook();