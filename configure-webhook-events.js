// Configurar eventos específicos para el webhook
require('dotenv').config({ path: '.env.local' });

const WEBHOOK_ID = '01K3HE5TEN84KR0WPG4JWXVRZ3';
const LIKE2WIN_FID = 1206612;

async function configureWebhookEvents() {
    console.log('🔧 Configurando eventos del webhook...');
    
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    
    if (!NEYNAR_API_KEY) {
        console.log('❌ No se encontró NEYNAR_API_KEY');
        return;
    }

    try {
        // Configurar suscripciones específicas para reacciones en posts de @Like2Win
        console.log(`📡 Configurando eventos para FID ${LIKE2WIN_FID}...`);
        
        const subscribeResponse = await fetch(`https://api.neynar.com/v2/farcaster/webhook/${WEBHOOK_ID}/subscription`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                event_type: 'reaction.created',
                filters: {
                    author_fids: [LIKE2WIN_FID]
                }
            })
        });

        console.log('Subscription response status:', subscribeResponse.status);
        
        if (subscribeResponse.ok) {
            const result = await subscribeResponse.json();
            console.log('✅ Suscripción configurada!');
            console.log('Response:', JSON.stringify(result, null, 2));
        } else {
            const error = await subscribeResponse.text();
            console.log('❌ Error configurando suscripción:', error);
        }

        // Verificar configuración actual
        console.log('\n🔍 Verificando configuración actual...');
        const checkResponse = await fetch(`https://api.neynar.com/v2/farcaster/webhook/${WEBHOOK_ID}`, {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        if (checkResponse.ok) {
            const webhookData = await checkResponse.json();
            console.log('Webhook configurado:');
            console.log('- Estado:', webhookData.webhook?.active ? 'Activo' : 'Inactivo');
            console.log('- URL:', webhookData.webhook?.target_url);
            console.log('- ID:', webhookData.webhook?.webhook_id);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

configureWebhookEvents();