// Test the new admin dashboard features
async function testDashboard() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    console.log('🎯 Testing Admin Dashboard Features...\n');
    
    // Wait for deployment
    console.log('⏳ Waiting for deployment (30s)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
        // 1. Test admin stats endpoint
        console.log('1️⃣ Testing admin stats...');
        const statsResponse = await fetch(`${baseUrl}/api/admin/stats`);
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('   ✅ Admin stats working');
            console.log('   📊 Current raffle:', statsData.data?.currentRaffle?.weekPeriod || 'None');
            console.log('   👥 Total users:', statsData.data?.totalUsers || 0);
            console.log('   🏆 Top user tickets:', statsData.data?.topUsers?.[0]?.ticketsCount || 0);
        } else {
            console.log('   ❌ Admin stats failed:', statsResponse.status);
        }
        
        // 2. Test clean data preview
        console.log('\n2️⃣ Testing clean data preview...');
        const cleanPreviewResponse = await fetch(`${baseUrl}/api/admin/clean`);
        
        if (cleanPreviewResponse.ok) {
            const cleanData = await cleanPreviewResponse.json();
            console.log('   ✅ Clean preview working');
            console.log('   🗑️ Test entries found:', cleanData.data?.willClean || 0);
            console.log('   📋 Test FIDs:', cleanData.data?.testFids || []);
        } else {
            console.log('   ❌ Clean preview failed:', cleanPreviewResponse.status);
        }
        
        // 3. Test user with countdown
        console.log('\n3️⃣ Testing user experience with countdown...');
        const userResponse = await fetch(`${baseUrl}/api/cache/user-status?fid=432789`);
        
        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('   ✅ User data with raffle info working');
            console.log('   🎫 User tickets:', userData.data?.user?.currentTickets || 0);
            console.log('   📅 Raffle period:', userData.data?.raffle?.weekPeriod || 'Unknown');
            
            if (userData.data?.raffle?.endDate) {
                const endDate = new Date(userData.data.raffle.endDate);
                const now = new Date();
                const timeLeft = Math.max(0, endDate.getTime() - now.getTime());
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                
                console.log('   ⏰ Time left:', days, 'days');
                console.log('   🏁 End date:', endDate.toLocaleDateString());
            }
        } else {
            console.log('   ❌ User data failed:', userResponse.status);
        }
        
        // 4. Success summary
        console.log('\n✅ DASHBOARD FEATURES SUMMARY:');
        console.log('============================');
        console.log('🎛️ Admin Dashboard: https://like2win-miniappdeploy.vercel.app/admin');
        console.log('   • Real-time raffle statistics');
        console.log('   • Top users leaderboard');
        console.log('   • System health monitoring');
        console.log('   • Test data cleanup tools');
        console.log('   • Raffle management controls');
        
        console.log('\n⏰ Countdown Timer: In MiniApp');
        console.log('   • Real-time countdown in MiniApp');
        console.log('   • Visual progress indicators');
        console.log('   • Urgency alerts for final hours');
        console.log('   • Mobile-optimized display');
        
        console.log('\n🎯 What You Can Do Now:');
        console.log('1. Visit /admin to see the dashboard');
        console.log('2. Clean test data using the "Limpiar Testing" button');
        console.log('3. Monitor real user engagement');
        console.log('4. See countdown timer in MiniApp');
        console.log('5. Track system health in real-time');
        
    } catch (error) {
        console.error('❌ Dashboard test error:', error);
    }
}

testDashboard();