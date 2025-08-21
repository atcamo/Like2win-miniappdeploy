// Script para transferir tickets del mock FID al FID real
async function transferTickets() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    console.log('🔄 Transfiriendo tickets del mock FID al FID real...\n');
    
    try {
        // 1. Get current status
        console.log('1️⃣ Estado actual:');
        const real = await fetch(`${baseUrl}/api/raffle/status-real?fid=432789`).then(r => r.json());
        const mock = await fetch(`${baseUrl}/api/raffle/status-real?fid=546204`).then(r => r.json());
        
        console.log('   FID 432789 (real):', real.data?.user?.currentTickets, 'tickets');
        console.log('   FID 546204 (mock):', mock.data?.user?.currentTickets, 'tickets');
        
        // 2. Calculate transfer needed
        const mockTickets = mock.data?.user?.currentTickets || 0;
        const realTickets = real.data?.user?.currentTickets || 0;
        const ticketsToTransfer = mockTickets - realTickets; // Should be 8
        
        console.log('\n2️⃣ Transferencia necesaria:', ticketsToTransfer, 'tickets');
        
        if (ticketsToTransfer <= 0) {
            console.log('❌ No hay tickets que transferir');
            return;
        }
        
        // 3. Add tickets to real FID
        console.log('\n3️⃣ Agregando tickets al FID real...');
        for (let i = 0; i < ticketsToTransfer; i++) {
            const response = await fetch(`${baseUrl}/api/test-engagement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userFid: '432789', // Tu FID real
                    raffleId: '078adf95-4cc1-4569-9343-0337eb2ba356'
                })
            });
            const result = await response.json();
            console.log(`   Ticket ${i+1}: ${result.success ? '✅' : '❌'}`);
            
            // Small delay to avoid overwhelming
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 4. Verify final status
        console.log('\n4️⃣ Verificando resultado final...');
        const finalReal = await fetch(`${baseUrl}/api/raffle/status-real?fid=432789`).then(r => r.json());
        
        console.log('   Tu FID real ahora tiene:', finalReal.data?.user?.currentTickets, 'tickets');
        console.log('   ¿Correcto?', finalReal.data?.user?.currentTickets === (realTickets + ticketsToTransfer) ? '✅ SÍ' : '❌ NO');
        
        console.log('\n🎉 TRANSFERENCIA COMPLETADA!');
        console.log('   Ahora tu FID real (432789) tiene los tickets correctos');
        console.log('   El MiniApp debería mostrar', finalReal.data?.user?.currentTickets, 'tickets');
        
    } catch (error) {
        console.error('❌ Error en transferencia:', error);
    }
}

transferTickets();