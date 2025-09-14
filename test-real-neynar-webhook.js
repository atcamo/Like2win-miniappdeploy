require('dotenv').config({ path: '.env.local' });

async function testRealNeynarWebhook() {
    console.log('🎯 TEST WEBHOOK CON FORMATO REAL DE NEYNAR');
    console.log('='.repeat(60));

    const WEBHOOK_URL = 'https://like2win-app.vercel.app/api/webhooks/neynar';

    try {
        // Simular un evento REAL de Neynar basado en los logs que viste
        const realNeynarEvent = {
            "created_at": 1757822377,
            "type": "reaction.created",
            "data": {
                "object": "reaction",
                "event_timestamp": "2025-09-14T03:59:37.469Z",
                "timestamp": "2025-09-14T03:59:34.000Z",
                "reaction_type": 1, // 1 = like, 2 = recast
                "target": {
                    "object": "cast_dehydrated",
                    "hash": "0xdb79bd99c84ea04d0165a680d1a1b543120a6276",
                    "author": {
                        "object": "user_dehydrated",
                        "fid": 1206612 // Like2Win FID
                    },
                    "parent_hash": null,
                    "parent_url": null,
                    "app": {
                        "object": "user_dehydrated",
                        "fid": 9152
                    }
                },
                "user": {
                    "object": "user_dehydrated",
                    "fid": 432789, // atcamo FID (el que está dando like)
                    "username": "atcamo",
                    "score": 0.88
                },
                "cast": {
                    "object": "cast_dehydrated",
                    "hash": "0xdb79bd99c84ea04d0165a680d1a1b543120a6276",
                    "author": {
                        "object": "user_dehydrated",
                        "fid": 1206612 // Like2Win FID
                    },
                    "parent_hash": null,
                    "parent_url": null,
                    "app": {
                        "object": "user_dehydrated",
                        "fid": 9152
                    }
                }
            }
        };

        console.log('1️⃣ Enviando evento REAL de Neynar al webhook...');
        console.log('📤 Evento:', JSON.stringify(realNeynarEvent, null, 2));
        console.log('');

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Neynar-Webhook/1.0'
            },
            body: JSON.stringify(realNeynarEvent)
        });

        const responseText = await response.text();

        console.log('2️⃣ Respuesta del webhook:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Headers:`, [...response.headers.entries()]);
        console.log(`   Body: ${responseText}`);

        if (response.ok) {
            try {
                const result = JSON.parse(responseText);
                console.log('\\n✅ Webhook respondió correctamente:');
                console.log(`   Procesado: ${result.processed}`);
                console.log(`   Mensaje: ${result.message}`);

                if (result.result) {
                    console.log(`   Success: ${result.result.success}`);
                    console.log(`   Tickets otorgados: ${result.result.ticketsAwarded || 'N/A'}`);
                    console.log(`   Total tickets: ${result.result.totalTickets || 'N/A'}`);
                    console.log(`   Usuario: ${result.result.userFid || 'N/A'}`);
                    console.log(`   Tipo engagement: ${result.result.engagementType || 'N/A'}`);
                    console.log(`   Storage: ${result.result.storage || 'N/A'}`);
                }
            } catch (parseError) {
                console.log('⚠️ Respuesta recibida pero no es JSON válido');
            }
        } else {
            console.log('❌ Webhook falló');
        }

        // 3. Verificar stats después del test
        console.log('\\n3️⃣ Verificando estadísticas después del test...');
        const statsResponse = await fetch('https://like2win-app.vercel.app/api/admin/stats');

        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            console.log('📊 Stats actuales:');
            console.log(`   Source: ${stats.source}`);
            console.log(`   Participantes: ${stats.data?.totalUsers || 'N/A'}`);
            console.log(`   Total tickets: ${stats.data?.currentRaffle?.totalTickets || 'N/A'}`);
            console.log(`   Raffle ID: ${stats.data?.currentRaffle?.id || 'N/A'}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testRealNeynarWebhook();