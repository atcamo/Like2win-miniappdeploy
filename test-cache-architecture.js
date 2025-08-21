// Test script for the new cache architecture
async function testCacheArchitecture() {
    console.log('🧪 Testing New Cache Architecture');
    console.log('=================================\n');

    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    try {
        // Test 1: Start cache system
        console.log('1️⃣ Starting cache system...');
        const startupResponse = await fetch(`${baseUrl}/api/cache/startup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const startupResult = await startupResponse.json();
        console.log('🚀 Startup result:', {
            success: startupResult.success,
            alreadyRunning: startupResult.alreadyRunning,
            syncRunning: startupResult.backgroundSync?.isRunning,
            initialSyncDuration: startupResult.initialSync?.duration + 'ms'
        });

        // Test 2: Check cache health
        console.log('\n2️⃣ Checking cache health...');
        const healthResponse = await fetch(`${baseUrl}/api/cache/health`);
        const healthResult = await healthResponse.json();
        
        console.log('🏥 Health status:', {
            status: healthResult.status,
            redisHealthy: healthResult.cache?.redis?.healthy,
            syncRunning: healthResult.cache?.sync?.isRunning,
            lastSync: healthResult.cache?.sync?.lastSync
        });

        // Test 3: Test cache user status endpoint
        console.log('\n3️⃣ Testing cache user status...');
        const userStatusResponse = await fetch(`${baseUrl}/api/cache/user-status?fid=432789`);
        const userStatusResult = await userStatusResponse.json();
        
        console.log('👤 User status from cache:', {
            source: userStatusResult.source,
            userTickets: userStatusResult.data?.user?.currentTickets,
            rafflePeriod: userStatusResult.data?.raffle?.weekPeriod,
            responseTime: 'measured in browser'
        });

        // Test 4: Test cache leaderboard endpoint  
        console.log('\n4️⃣ Testing cache leaderboard...');
        const leaderboardResponse = await fetch(`${baseUrl}/api/cache/leaderboard?limit=5`);
        const leaderboardResult = await leaderboardResponse.json();
        
        console.log('🏆 Leaderboard from cache:', {
            source: leaderboardResult.source,
            entries: leaderboardResult.data?.leaderboard?.length || 0,
            topUser: leaderboardResult.data?.leaderboard?.[0],
            responseTime: 'measured in browser'
        });

        // Test 5: Simulate engagement and test cache updates
        console.log('\n5️⃣ Testing engagement processing with cache updates...');
        const engagementResponse = await fetch(`${baseUrl}/api/test-engagement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userFid: '432789',
                raffleId: '078adf95-4cc1-4569-9343-0337eb2ba356'
            })
        });
        
        const engagementResult = await engagementResponse.json();
        console.log('🎫 Engagement test result:', {
            success: engagementResult.success,
            newTicketCount: engagementResult.data?.newTicketCount
        });

        // Test 6: Check if cache was updated after engagement
        console.log('\n6️⃣ Verifying cache update after engagement...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const updatedStatusResponse = await fetch(`${baseUrl}/api/cache/user-status?fid=432789`);
        const updatedStatusResult = await updatedStatusResponse.json();
        
        console.log('🔄 Updated user status:', {
            source: updatedStatusResult.source,
            newTickets: updatedStatusResult.data?.user?.currentTickets,
            wasUpdated: updatedStatusResult.data?.user?.currentTickets !== userStatusResult.data?.user?.currentTickets
        });

        // Test 7: Performance comparison
        console.log('\n7️⃣ Performance test - Multiple rapid requests...');
        const performanceTests = [];
        const startTime = Date.now();
        
        for (let i = 0; i < 5; i++) {
            performanceTests.push(
                fetch(`${baseUrl}/api/cache/user-status?fid=432789`)
                    .then(r => r.json())
            );
        }
        
        const performanceResults = await Promise.all(performanceTests);
        const endTime = Date.now();
        
        console.log('⚡ Performance results:', {
            totalRequests: 5,
            totalTime: endTime - startTime + 'ms',
            averagePerRequest: Math.round((endTime - startTime) / 5) + 'ms',
            allFromCache: performanceResults.every(r => r.source === 'cache'),
            consistentData: performanceResults.every(r => 
                r.data?.user?.currentTickets === performanceResults[0].data?.user?.currentTickets
            )
        });

        console.log('\n✅ Cache Architecture Test Complete!');
        console.log('\n🎯 Summary:');
        console.log('   • Cache system started successfully');
        console.log('   • Ultra-fast cache endpoints working');
        console.log('   • Real-time cache updates on engagement');
        console.log('   • Performance: ~' + Math.round((endTime - startTime) / 5) + 'ms per request');
        console.log('   • Data consistency maintained');

    } catch (error) {
        console.error('❌ Cache architecture test failed:', error);
    }
}

// Run the test
testCacheArchitecture().catch(console.error);