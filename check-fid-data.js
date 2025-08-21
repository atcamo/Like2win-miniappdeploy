// Verificar datos reales de ambos FIDs
async function checkFIDData() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    console.log('🔍 Verificando datos de ambos FIDs...\n');
    
    try {
        // Check FID 432789 (tu FID real)
        console.log('1️⃣ FID 432789 (tu FID real):');
        const response1 = await fetch(`${baseUrl}/api/raffle/status-real?fid=432789`);
        const data1 = await response1.json();
        console.log('   Tickets:', data1.data?.user?.currentTickets);
        console.log('   Response:', data1.success ? '✅' : '❌');
        
        // Check FID 546204 (mock FID) 
        console.log('\n2️⃣ FID 546204 (mock FID):');
        const response2 = await fetch(`${baseUrl}/api/raffle/status-real?fid=546204`);
        const data2 = await response2.json();
        console.log('   Tickets:', data2.data?.user?.currentTickets);
        console.log('   Response:', data2.success ? '✅' : '❌');
        
        // Show the mismatch
        console.log('\n🎯 ANÁLISIS:');
        console.log('   Tu FID real (432789) tiene:', data1.data?.user?.currentTickets, 'tickets');
        console.log('   Mock FID (546204) tiene:', data2.data?.user?.currentTickets, 'tickets');
        
        console.log('\n💡 HIPÓTESIS:');
        if (data2.data?.user?.currentTickets > data1.data?.user?.currentTickets) {
            console.log('   ❌ Los tickets se asignaron al FID equivocado durante testing');
            console.log('   ❌ Tus likes reales se registraron bajo el mock FID 546204');
            console.log('   ❌ El MiniApp muestra el mock FID en lugar del real');
        }
        
        // Check test engagement endpoint too
        console.log('\n3️⃣ Verificando endpoint de test engagement...');
        const testResponse = await fetch(`${baseUrl}/api/test-engagement`, {
            method: 'GET'
        });
        const testData = await testResponse.json();
        console.log('   Default FID usado:', testData.defaults?.userFid);
        console.log('   ¿Coincide con mock?', testData.defaults?.userFid === '546204' ? '✅' : '❌');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkFIDData();