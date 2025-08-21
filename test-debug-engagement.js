// Test debug engagement service step by step
async function testDebugEngagement() {
    console.log('🔍 Testing Debug Engagement Service');
    console.log('===================================\n');

    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    // Test 1: Step-by-step database operations
    console.log('1️⃣ Testing step-by-step database operations...');
    try {
        const stepResponse = await fetch(`${baseUrl}/api/debug/engagement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                testType: 'step-by-step',
                userFid: '546204',
                raffleId: '078adf95-4cc1-4569-9343-0337eb2ba356'
            })
        });
        
        const stepResult = await stepResponse.json();
        console.log('📊 Step-by-step results:');
        stepResult.results?.forEach((result, index) => {
            const icon = result.success ? '✅' : '❌';
            console.log(`   ${icon} ${result.step}`);
            if (!result.success) {
                console.log(`      Error: ${result.error}`);
            }
        });
    } catch (error) {
        console.error('❌ Step-by-step test failed:', error);
    }

    console.log('\n');

    // Test 2: Simple ticket awarding
    console.log('2️⃣ Testing simple ticket awarding...');
    try {
        const awardResponse = await fetch(`${baseUrl}/api/debug/engagement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                testType: 'simple-award',
                userFid: '546204',
                raffleId: '078adf95-4cc1-4569-9343-0337eb2ba356'
            })
        });
        
        const awardResult = await awardResponse.json();
        console.log('🎫 Simple award result:');
        if (awardResult.success) {
            console.log('   ✅ SUCCESS!');
            console.log('   📊 Details:', awardResult.result.details);
        } else {
            console.log('   ❌ FAILED');
            console.log('   📊 Error:', awardResult.result.details);
        }
    } catch (error) {
        console.error('❌ Simple award test failed:', error);
    }

    // Test 3: Verify user status after tests
    console.log('\n3️⃣ Checking user status after tests...');
    try {
        const statusResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=546204`);
        const statusData = await statusResponse.json();
        
        console.log('👤 Current user status:');
        console.log('   🎫 Tickets:', statusData.data?.user?.currentTickets);
        console.log('   📊 Total raffle tickets:', statusData.data?.raffle?.totalTickets);
    } catch (error) {
        console.error('❌ Status check failed:', error);
    }

    console.log('\n🎯 Debug Complete!');
}

testDebugEngagement().catch(console.error);