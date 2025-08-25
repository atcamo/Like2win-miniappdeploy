// Reconfigurar webhook de Neynar
require('dotenv').config({ path: '.env.local' });

const WEBHOOK_URL = 'https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar';
const LIKE2WIN_FID = 1206612;

async function setupNeynarWebhook() {
    console.log('🔗 Reconfigurando Webhook de Neynar para Like2Win...');
    
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    
    if (!NEYNAR_API_KEY) {
        console.log('❌ No se encontró NEYNAR_API_KEY en .env.local');
        return;
    }

    console.log('✅ API Key encontrada');
    console.log('Webhook URL:', WEBHOOK_URL);
    console.log('FID Oficial:', LIKE2WIN_FID);

    try {
        // 1. Listar webhooks existentes
        console.log('\n📋 Verificando webhooks existentes...');
        const listResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook', {
            headers: {
                'accept': 'application/json',
                'api_key': NEYNAR_API_KEY
            }
        });

        if (listResponse.ok) {
            const existingWebhooks = await listResponse.json();
            console.log('Webhooks existentes:', existingWebhooks.webhooks?.length || 0);
            
            if (existingWebhooks.webhooks?.length > 0) {
                console.log('Detalles de webhooks:');
                existingWebhooks.webhooks.forEach((w, i) => {
                    console.log(`${i+1}. ID: ${w.webhook_id}, URL: ${w.url}, Active: ${w.active}`);
                });
                
                // Buscar webhook existente para Like2Win
                const existingLike2Win = existingWebhooks.webhooks.find(w => 
                    w.url === WEBHOOK_URL
                );
                
                if (existingLike2Win) {
                    console.log(`\n⚠️ Ya existe webhook: ${existingLike2Win.webhook_id}`);
                    
                    if (!existingLike2Win.active) {
                        console.log('🔄 Activando webhook existente...');
                        const updateResponse = await fetch(`https://api.neynar.com/v2/farcaster/webhook/${existingLike2Win.webhook_id}`, {
                            method: 'PUT',
                            headers: {
                                'accept': 'application/json',
                                'api_key': NEYNAR_API_KEY,
                                'content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                active: true
                            })
                        });
                        
                        if (updateResponse.ok) {
                            console.log('✅ Webhook activado correctamente');
                            return;
                        }
                    } else {
                        console.log('✅ Webhook ya está activo');
                        return;
                    }
                }
            }
        }

        // 2. Crear nuevo webhook
        console.log('\n🆕 Creando nuevo webhook...');
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
                event_types: ['reaction.created', 'cast.mentioned'],
                filters: {
                    reaction: {
                        fids: [LIKE2WIN_FID]
                    },
                    mention: {
                        fids: [LIKE2WIN_FID]
                    }
                }
            })
        });

        console.log('Response status:', createResponse.status);
        
        if (createResponse.ok) {
            const result = await createResponse.json();
            console.log('✅ Webhook creado exitosamente!');
            console.log('Full response:', JSON.stringify(result, null, 2));
            
        } else {
            const error = await createResponse.text();
            console.log('❌ Error creando webhook:', createResponse.status);
            console.log('Error details:', error);
        }

    } catch (error) {
        console.error('❌ Error en configuración:', error);
    }
}

setupNeynarWebhook();