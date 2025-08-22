// Investigar por qué el webhook no procesa likes automáticamente
async function investigateWebhookFlow() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    console.log('🔍 Investigando flujo de webhook completo...\n');
    
    try {
        // 1. Test webhook endpoint directly
        console.log('1️⃣ Probando webhook endpoint directamente...');
        const webhookTestResponse = await fetch(`${baseUrl}/api/webhooks/neynar`, {
            method: 'GET'
        });
        const webhookInfo = await webhookTestResponse.json();
        
        console.log('   Webhook status:', webhookInfo.status);
        console.log('   Supported events:', webhookInfo.supportedEvents);
        console.log('   Webhook URL:', webhookInfo.webhookUrl);
        
        // 2. Test engagement processing endpoint
        console.log('\n2️⃣ Probando endpoint de procesamiento de engagement...');
        const engagementTestResponse = await fetch(`${baseUrl}/api/engagement/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'like',
                userFid: '589396',
                castHash: 'test-cast-hash-12345',
                timestamp: new Date().toISOString(),
                authorFid: '1206612' // Official Like2Win FID
            })
        });
        
        if (engagementTestResponse.ok) {
            const engagementResult = await engagementTestResponse.json();
            console.log('   Engagement processing: ✅');
            console.log('   Result:', JSON.stringify(engagementResult, null, 2));
        } else {
            const errorText = await engagementTestResponse.text();
            console.log('   Engagement processing: ❌');
            console.log('   Error:', errorText);
        }
        
        // 3. Check if Neynar webhook is actually configured
        console.log('\n3️⃣ Verificando configuración de Neynar...');
        console.log('   🎯 PROBLEMA PROBABLE: El webhook de Neynar no está configurado');
        console.log('   📋 Para configurar webhook en Neynar:');
        console.log('      1. Ir a https://neynar.com/');
        console.log('      2. Configurar webhook para eventos "reaction.created"');
        console.log('      3. URL del webhook: ' + webhookInfo.webhookUrl);
        console.log('      4. Filtrar por FID autor: 1206612 (Like2Win oficial)');
        
        // 4. Test the EngagementService directly
        console.log('\n4️⃣ Verificando EngagementService...');
        console.log('   El EngagementService procesa eventos cuando:');
        console.log('   • Hay un raffle activo ✅');
        console.log('   • El like es en post de FID 1206612 ⚠️');
        console.log('   • El engagement no fue procesado antes ⚠️');
        
        // 5. Check active raffle
        console.log('\n5️⃣ Verificando raffle activo...');
        const raffleResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=589396`);
        const raffleData = await raffleResponse.json();
        
        console.log('   Raffle activo:', raffleData.data?.raffle?.weekPeriod || 'None');
        console.log('   Estado raffle:', raffleData.data?.raffle?.status || 'Unknown');
        console.log('   Periodo válido:', raffleData.success ? '✅' : '❌');
        
        // 6. Test direct EngagementService call
        console.log('\n6️⃣ Simulando evento de webhook real...');
        
        // Create a realistic webhook payload
        const webhookPayload = {
            type: 'reaction.created',
            data: {
                reaction: {
                    type: 'like',
                    timestamp: new Date().toISOString()
                },
                cast: {
                    hash: '0x' + Math.random().toString(16).substring(2, 18),
                    author: {
                        fid: 1206612,
                        username: 'like2win'
                    }
                },
                user: {
                    fid: 589396
                }
            }
        };
        
        const simulatedWebhookResponse = await fetch(`${baseUrl}/api/webhooks/neynar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
        });
        
        if (simulatedWebhookResponse.ok) {
            const webhookResult = await simulatedWebhookResponse.json();
            console.log('   Webhook simulation: ✅');
            console.log('   Result:', JSON.stringify(webhookResult, null, 2));
            
            // Check if ticket was awarded
            console.log('\n   Verificando si se otorgó ticket...');
            const afterResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=589396`);
            const afterData = await afterResponse.json();
            console.log('   Tickets después:', afterData.data?.user?.currentTickets);
            
        } else {
            console.log('   Webhook simulation: ❌');
            console.log('   Error:', await simulatedWebhookResponse.text());
        }
        
        console.log('\n🎯 DIAGNÓSTICO FINAL:');
        console.log('====================');
        
    } catch (error) {
        console.error('❌ Error en investigación:', error);
    }
}

investigateWebhookFlow();