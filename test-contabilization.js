// Test if the fixed engagement service now works
async function testContabilization() {
    console.log('🧪 Testing Fixed Engagement Service');
    console.log('==================================\n');

    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    // Test engagement processing
    const testPayload = {
        type: 'like',
        userFid: '546204',
        castHash: `test_fix_${Date.now()}`,
        timestamp: new Date().toISOString()
    };
    
    console.log('📤 Sending engagement test:', testPayload);
    
    try {
        const response = await fetch(`${baseUrl}/api/engagement/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
        });
        
        const result = await response.json();
        
        console.log('\n📊 Response Status:', response.status);
        console.log('📋 Response Data:', JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('\n✅ SUCCESS: Engagement processed successfully!');
            console.log('🎫 Tickets Awarded:', result.data?.ticketsAwarded);
            console.log('🎯 Total Tickets:', result.data?.totalTickets);
            
            // Check user status
            console.log('\n🔍 Checking user status...');
            const statusResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=546204`);
            const statusData = await statusResponse.json();
            
            console.log('👤 User tickets now:', statusData.data?.user?.currentTickets);
            
        } else {
            console.log('\n❌ FAILED:', result.message);
            
            if (result.message === 'Failed to award tickets') {
                console.log('🔧 Still having database issues. Need to investigate further.');
            }
        }
        
    } catch (error) {
        console.error('❌ Error testing engagement:', error);
    }
}

testContabilization().catch(console.error);