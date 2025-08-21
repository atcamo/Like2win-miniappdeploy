async function testEngagement() {
  const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
  
  console.log('🎯 Testing engagement API for user FID 546204...');
  
  // First, check current raffle status
  console.log('\n📊 Checking current raffle status...');
  const statusResponse = await fetch(`${baseUrl}/api/engagement/process`);
  const statusData = await statusResponse.json();
  console.log('Raffle status:', JSON.stringify(statusData, null, 2));
  
  if (!statusData.currentRaffle) {
    console.log('❌ No active raffle found');
    return;
  }
  
  // Add multiple tickets for the user
  const userFid = '546204';
  const tickets = [];
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n🎫 Adding ticket ${i} for user ${userFid}...`);
    
    const engagementResponse = await fetch(`${baseUrl}/api/engagement/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'like',
        userFid: userFid,
        castHash: `demo_like_${userFid}_${Date.now()}_${i}`,
        timestamp: new Date().toISOString()
      })
    });
    
    const engagementResult = await engagementResponse.json();
    console.log(`Response ${i}:`, JSON.stringify(engagementResult, null, 2));
    tickets.push(engagementResult);
  }
  
  // Check final status
  console.log('\n📈 Checking user status after adding tickets...');
  const finalStatusResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=${userFid}`);
  const finalStatusData = await finalStatusResponse.json();
  console.log('Final user status:', JSON.stringify(finalStatusData.data?.user, null, 2));
}

testEngagement().catch(console.error);