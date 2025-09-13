// Configurar webhook de Neynar automáticamente
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'TU_API_KEY_AQUI';
const WEBHOOK_URL = 'https://like2win-app.vercel.app/api/webhooks/neynar';
const LIKE2WIN_FID = 1206612;

async function setupNeynarWebhook() {
    console.log('🔗 Configurando Webhook de Neynar para Like2Win...');
    console.log('Webhook URL:', WEBHOOK_URL);
    console.log('FID Oficial:', LIKE2WIN_FID);
    console.log('');

    if (NEYNAR_API_KEY === 'TU_API_KEY_AQUI') {
        console.log('❌ Error: Configura tu NEYNAR_API_KEY en las variables de entorno');
        console.log('');
        console.log('🔧 Opciones:');
        console.log('1. export NEYNAR_API_KEY="tu_api_key_real"');
        console.log('2. Agrega NEYNAR_API_KEY a tu archivo .env.local');
        console.log('3. Reemplaza TU_API_KEY_AQUI en este script');
        return;
    }

    try {
        // 1. Verificar webhooks existentes
        console.log('📋 Verificando webhooks existentes...');
        const listResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook', {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        if (listResponse.ok) {
            const existingWebhooks = await listResponse.json();
            console.log('Webhooks existentes:', existingWebhooks.webhooks?.length || 0);
            
            // Buscar webhook existente para Like2Win
            const existingLike2Win = existingWebhooks.webhooks?.find(w => 
                w.url === WEBHOOK_URL || w.name?.includes('Like2Win')
            );
            
            if (existingLike2Win) {
                console.log('⚠️ Ya existe un webhook para Like2Win:', existingLike2Win.webhook_id);
                console.log('URL:', existingLike2Win.url);
                return;
            }
        }

        // 2. Crear nuevo webhook
        console.log('🆕 Creando nuevo webhook...');
        const createResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Like2Win Engagement Tracker',
                url: WEBHOOK_URL,
                subscription: {
                    'cast.created': {
                        author_fids: [LIKE2WIN_FID]
                    },
                    'reaction.created': {
                        cast_author_fids: [LIKE2WIN_FID]
                    }
                }
            })
        });

        const result = await createResponse.json();

        if (createResponse.ok) {
            console.log('✅ Webhook configurado exitosamente!');
            console.log('Webhook ID:', result.webhook_id);
            console.log('');
            console.log('🎯 El sistema ahora detectará automáticamente:');
            console.log('   - Likes en posts del FID', LIKE2WIN_FID);
            console.log('   - Nuevos posts del usuario oficial');
            console.log('');
            console.log('📊 Verifica el estado en:', WEBHOOK_URL);
        } else {
            console.log('❌ Error creando webhook:', result);
        }

    } catch (error) {
        console.error('❌ Error configurando webhook:', error);
    }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
    setupNeynarWebhook();
}

module.exports = { setupNeynarWebhook };