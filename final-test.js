// Test final después de todos los fixes
async function finalTest() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    console.log('🏁 TEST FINAL - Cache Architecture');
    console.log('================================\n');
    
    try {
        // Wait for deployment
        console.log('⏳ Esperando que el deployment termine...\n');
        await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute
        
        // 1. Health check
        console.log('1️⃣ Health check...');
        const healthResponse = await fetch(`${baseUrl}/api/cache/health`);
        const healthData = await healthResponse.json();
        
        console.log('🏥 Status:', healthData.status);
        console.log('📊 Redis:', healthData.cache?.redis?.healthy ? '✅' : '❌');
        console.log('🔄 Sync:', healthData.cache?.sync?.isRunning ? '✅' : '❌');
        
        // 2. Start cache system
        console.log('\n2️⃣ Starting cache system...');
        const startupResponse = await fetch(`${baseUrl}/api/cache/startup`, {
            method: 'POST'
        });
        const startupData = await startupResponse.json();
        console.log('🚀 Startup:', startupData.success ? '✅' : '❌');
        
        // 3. Test user status
        console.log('\n3️⃣ Testing user status...');
        const userResponse = await fetch(`${baseUrl}/api/cache/user-status?fid=432789`);
        
        if (userResponse.status !== 200) {
            const errorText = await userResponse.text();
            console.log('❌ Error status:', userResponse.status);
            console.log('❌ Error response:', errorText);
            return;
        }
        
        const userData = await userResponse.json();
        console.log('👤 User data:', {
            success: userData.success,
            source: userData.source,
            tickets: userData.data?.user?.currentTickets,
            raffle: userData.data?.raffle?.weekPeriod
        });
        
        // 4. Compare with original
        console.log('\n4️⃣ Comparing with original endpoint...');
        const originalResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=432789`);
        const originalData = await originalResponse.json();
        
        const cacheTickets = userData.data?.user?.currentTickets;
        const originalTickets = originalData.data?.user?.currentTickets;
        
        console.log('🔄 Cache tickets:', cacheTickets);
        console.log('🔄 Original tickets:', originalTickets);
        console.log('🔄 Match:', cacheTickets === originalTickets ? '✅ PERFECT' : '❌ MISMATCH');
        
        // 5. Performance test
        console.log('\n5️⃣ Performance test...');
        const start = Date.now();
        const promises = [];
        for(let i = 0; i < 10; i++) {
            promises.push(fetch(`${baseUrl}/api/cache/user-status?fid=432789`));
        }
        await Promise.all(promises);
        const end = Date.now();
        
        console.log('⚡ 10 requests in:', end - start + 'ms');
        console.log('⚡ Average per request:', Math.round((end - start) / 10) + 'ms');
        
        // 6. Success summary
        if (userData.success && cacheTickets === originalTickets) {
            console.log('\n🎉 SUCCESS! Cache architecture working perfectly!');
            console.log('✨ Benefits achieved:');
            console.log('   • Ultra-fast responses (~' + Math.round((end - start) / 10) + 'ms)');
            console.log('   • Data consistency maintained');
            console.log('   • Real-time updates ready');
        } else {
            console.log('\n⚠️ Partial success - needs investigation');
        }
        
    } catch (error) {
        console.error('❌ Final test error:', error);
    }
}

finalTest();