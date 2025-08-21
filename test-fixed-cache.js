// Test después de los fixes de schema
async function testFixedCache() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    console.log('🧪 Probando cache después de fixes de schema...\n');
    
    try {
        // 1. Restart cache system
        console.log('1️⃣ Reiniciando sistema de cache...');
        const startupResponse = await fetch(`${baseUrl}/api/cache/startup`, {
            method: 'POST'
        });
        const startupData = await startupResponse.json();
        console.log('🚀 Startup:', startupData.success ? '✅' : '❌', startupData.message);
        
        // 2. Test user status (should work now)
        console.log('\n2️⃣ Probando user status...');
        const userResponse = await fetch(`${baseUrl}/api/cache/user-status?fid=432789`);
        const userData = await userResponse.json();
        
        console.log('👤 Tu estado:', {
            success: userData.success,
            source: userData.source,
            tickets: userData.data?.user?.currentTickets,
            raffle: userData.data?.raffle?.weekPeriod
        });
        
        // 3. Compare with original
        console.log('\n3️⃣ Comparando con original...');
        const originalResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=432789`);
        const originalData = await originalResponse.json();
        
        const cacheTickets = userData.data?.user?.currentTickets;
        const originalTickets = originalData.data?.user?.currentTickets;
        
        console.log('🔄 Comparación:', {
            cache: cacheTickets,
            original: originalTickets,
            match: cacheTickets === originalTickets ? '✅' : '❌'
        });
        
        // 4. Test performance 
        console.log('\n4️⃣ Test de performance...');
        const start = Date.now();
        
        const promises = [];
        for(let i = 0; i < 5; i++) {
            promises.push(fetch(`${baseUrl}/api/cache/user-status?fid=432789`));
        }
        
        await Promise.all(promises);
        const end = Date.now();
        
        console.log('⚡ Performance:', {
            totalRequests: 5,
            totalTime: end - start + 'ms',
            avgPerRequest: Math.round((end - start) / 5) + 'ms'
        });
        
        console.log('\n✅ TEST COMPLETADO!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Wait 30 seconds then test
console.log('⏳ Esperando 30 segundos para que termine el deploy...');
setTimeout(testFixedCache, 30000);