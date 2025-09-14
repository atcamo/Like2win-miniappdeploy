// Test directo del webhook simulando un evento de Neynar
require('dotenv').config({ path: '.env.local' });

async function testWebhookDirect() {
    console.log('🎯 TEST DIRECTO DEL WEBHOOK');
    console.log('='.repeat(50));

    const WEBHOOK_URL = 'https://like2win-app.vercel.app/api/webhooks/neynar';

    try {
        // Simular un evento de like de Neynar
        const mockEvent = {
            type: 'reaction.created',
            data: {
                reaction: {
                    type: 'like'
                },
                cast: {
                    hash: '0xdb79bd99c84ea04d0165a680d1a1b543120a6276',
                    author: {
                        fid: 1206612,  // FID de @Like2Win
                        username: 'like2win'
                    },
                    text: '14-09-2025 🎫 Daily DEGEN Raffle...',
                    timestamp: new Date().toISOString()
                },
                user: {
                    fid: 12345,  // FID del usuario que dio like
                    username: 'test_user',
                    display_name: 'Test User',
                    pfp_url: 'https://example.com/pfp.png'
                }
            }
        };

        console.log('1️⃣ Enviando evento simulado al webhook...');
        console.log('📤 Evento:', JSON.stringify(mockEvent, null, 2));
        console.log('');

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Neynar-Webhook/1.0'
            },
            body: JSON.stringify(mockEvent)
        });

        const responseText = await response.text();

        console.log('2️⃣ Respuesta del webhook:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Headers:`, [...response.headers.entries()]);
        console.log(`   Body: ${responseText}`);

        if (response.ok) {
            try {
                const result = JSON.parse(responseText);
                console.log('\n✅ Webhook respondió correctamente:');
                console.log(`   Procesado: ${result.processed}`);
                console.log(`   Mensaje: ${result.message}`);

                if (result.result) {
                    console.log(`   Tickets otorgados: ${result.result.ticketsAwarded}`);
                    console.log(`   Total tickets: ${result.result.totalTickets}`);
                    console.log(`   Usuario: ${result.result.userFid}`);
                }
            } catch (parseError) {
                console.log('⚠️ Respuesta recibida pero no es JSON válido');
            }
        } else {
            console.log('❌ Webhook falló');
        }

        // 3. Verificar stats después del test
        console.log('\n3️⃣ Verificando estadísticas después del test...');
        const statsResponse = await fetch('https://like2win-app.vercel.app/api/admin/stats');

        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            console.log('📊 Stats actuales:');
            console.log(`   Participantes: ${stats.data?.participants || 'N/A'}`);
            console.log(`   Total tickets: ${stats.data?.totalTickets || 'N/A'}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testWebhookDirect();