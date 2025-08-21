// Debug script to test engagement service step by step
async function debugEngagement() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    console.log('🔍 DEBUGGING ENGAGEMENT SYSTEM');
    console.log('================================\n');
    
    // 1. Check current raffle
    console.log('1️⃣ Checking current raffle status...');
    const raffleResponse = await fetch(`${baseUrl}/api/engagement/process`);
    const raffleData = await raffleResponse.json();
    
    console.log('✅ Current raffle:', {
        id: raffleData.currentRaffle?.id,
        weekPeriod: raffleData.currentRaffle?.weekPeriod,
        startDate: raffleData.currentRaffle?.startDate,
        endDate: raffleData.currentRaffle?.endDate,
        isActive: raffleData.currentRaffle?.isActive
    });
    
    // 2. Test timestamp validation
    const testTimestamp = new Date().toISOString();
    const raffleStart = new Date(raffleData.currentRaffle.startDate);
    const raffleEnd = new Date(raffleData.currentRaffle.endDate);
    const currentTime = new Date(testTimestamp);
    
    console.log('\n2️⃣ Timestamp validation:');
    console.log('Current time:', testTimestamp);
    console.log('Raffle start:', raffleData.currentRaffle.startDate);
    console.log('Raffle end:  ', raffleData.currentRaffle.endDate);
    console.log('Is within range?', currentTime >= raffleStart && currentTime <= raffleEnd);
    
    // 3. Test engagement processing
    console.log('\n3️⃣ Testing engagement processing...');
    const engagementPayload = {
        type: 'like',
        userFid: '546204',
        castHash: `debug_test_${Date.now()}`,
        timestamp: testTimestamp
    };
    
    console.log('Payload:', engagementPayload);
    
    const engagementResponse = await fetch(`${baseUrl}/api/engagement/process`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(engagementPayload)
    });
    
    const engagementResult = await engagementResponse.json();
    console.log('Response status:', engagementResponse.status);
    console.log('Response data:', engagementResult);
    
    // 4. Check database connectivity
    console.log('\n4️⃣ Testing database connectivity...');
    const dbTestResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=546204`);
    const dbTestResult = await dbTestResponse.json();
    
    console.log('Database response:', {
        success: dbTestResult.success,
        userTickets: dbTestResult.data?.user?.currentTickets,
        raffleId: dbTestResult.data?.raffle?.id
    });
    
    console.log('\n📊 ANALYSIS COMPLETE');
    console.log('==================');
}

debugEngagement().catch(console.error);