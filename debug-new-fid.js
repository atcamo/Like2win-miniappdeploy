// Diagnosticar por qué FID 589396 no tiene tickets después del like
async function debugNewFID() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    const fid = '589396';
    
    console.log(`🔍 Diagnosticando FID ${fid} con 0 tickets después de like...\n`);
    
    try {
        // 1. Check current status
        console.log('1️⃣ Estado actual del FID:');
        const statusResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=${fid}`);
        const statusData = await statusResponse.json();
        
        console.log('   Tickets actuales:', statusData.data?.user?.currentTickets || 0);
        console.log('   Response success:', statusData.success ? '✅' : '❌');
        console.log('   Raffle activo:', statusData.data?.raffle?.weekPeriod || 'N/A');
        
        // 2. Check if FID exists in database
        console.log('\n2️⃣ Verificando si el FID existe en BD...');
        console.log('   (Checking via status endpoint - if 0 tickets, might not exist)');
        
        // 3. Test manual ticket award
        console.log('\n3️⃣ Probando award manual de ticket...');
        const testResponse = await fetch(`${baseUrl}/api/test-engagement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userFid: fid,
                raffleId: '078adf95-4cc1-4569-9343-0337eb2ba356'
            })
        });
        
        const testResult = await testResponse.json();
        console.log('   Manual award result:', testResult.success ? '✅' : '❌');
        console.log('   New ticket count:', testResult.data?.newTicketCount);
        console.log('   Error (if any):', testResult.error || 'None');
        
        // 4. Check status after manual award
        console.log('\n4️⃣ Estado después del award manual:');
        const newStatusResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=${fid}`);
        const newStatusData = await newStatusResponse.json();
        
        console.log('   Tickets después:', newStatusData.data?.user?.currentTickets || 0);
        console.log('   ¿Se agregó ticket?', newStatusData.data?.user?.currentTickets > 0 ? '✅ SÍ' : '❌ NO');
        
        // 5. Possible reasons analysis
        console.log('\n5️⃣ ANÁLISIS DE POSIBLES CAUSAS:');
        
        if (newStatusData.data?.user?.currentTickets > 0) {
            console.log('   ✅ Manual award funcionó - el problema es con el webhook/engagement automático');
            console.log('   📋 Posibles causas del like no procesado:');
            console.log('      • Webhook de Neynar no configurado para este FID');
            console.log('      • El like no fue en un post oficial de @Like2Win');
            console.log('      • El engagement ya fue procesado anteriormente');
            console.log('      • Timing - el like fue fuera del período de rifa');
        } else {
            console.log('   ❌ Manual award falló - problema más profundo');
            console.log('   📋 Posibles causas:');
            console.log('      • Database connection issues');
            console.log('      • FID format issues (string vs number)');
            console.log('      • Raffle ID incorrect or inactive');
            console.log('      • Permission/access issues');
        }
        
        // 6. Check webhook configuration
        console.log('\n6️⃣ Verificando configuración del webhook:');
        const webhookResponse = await fetch(`${baseUrl}/api/webhooks/neynar`);
        const webhookData = await webhookResponse.json();
        
        console.log('   Webhook status:', webhookData.status || 'Unknown');
        console.log('   Supported events:', webhookData.supportedEvents?.join(', ') || 'Unknown');
        
        // 7. Recommendations
        console.log('\n7️⃣ RECOMENDACIONES:');
        if (newStatusData.data?.user?.currentTickets > 0) {
            console.log('   🎯 El sistema funciona, el problema es específico del like automático');
            console.log('   💡 Verifica:');
            console.log('      - ¿El like fue en un post de @Like2Win (FID 1206612)?');
            console.log('      - ¿El webhook de Neynar está configurado?');
            console.log('      - ¿El like fue dentro del período de rifa activo?');
        } else {
            console.log('   🎯 Problema más fundamental con el sistema de tickets');
            console.log('   💡 Revisar logs del servidor y configuración de BD');
        }
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    }
}

debugNewFID();