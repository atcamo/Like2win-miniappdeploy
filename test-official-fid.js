// Test the webhook with official FID 1206612
async function testOfficialFID() {
    const webhookUrl = 'https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar';
    
    console.log('🎯 Testing Official FID 1206612 Detection');
    console.log('=========================================\n');
    
    // Simulate a webhook from Neynar for a like on official Like2Win post
    const mockWebhookPayload = {
        type: 'reaction.created',
        data: {
            reaction: {
                type: 'like',
                timestamp: new Date().toISOString()
            },
            cast: {
                hash: 'test_official_cast_hash_' + Date.now(),
                author: {
                    fid: 1206612,  // Official Like2Win FID
                    username: 'like2win'
                }
            },
            user: {
                fid: 546204  // Test user giving the like
            }
        }
    };
    
    console.log('📨 Simulating Neynar webhook with official FID...');
    console.log('Mock payload:', JSON.stringify(mockWebhookPayload, null, 2));
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockWebhookPayload)
        });
        
        const result = await response.json();
        
        console.log('\n📊 Webhook Response:');
        console.log('Status:', response.status);
        console.log('Result:', JSON.stringify(result, null, 2));
        
        if (result.processed) {
            console.log('\n✅ SUCCESS: Official post detected and processed!');
            
            // Check if tickets were awarded
            if (result.result && result.result.success) {
                console.log('🎫 Tickets awarded:', result.result.data?.ticketsAwarded);
                console.log('🎯 Total tickets:', result.result.data?.totalTickets);
            }
        } else {
            console.log('\n❌ FAILED: Post not processed');
            console.log('Reason:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing webhook:', error);
    }
    
    // Also test with non-official FID to ensure filtering works
    console.log('\n🔒 Testing Non-Official FID (should be rejected)...');
    
    const nonOfficialPayload = {
        ...mockWebhookPayload,
        data: {
            ...mockWebhookPayload.data,
            cast: {
                ...mockWebhookPayload.data.cast,
                author: {
                    fid: 999999,  // Non-official FID
                    username: 'randomuser'
                }
            }
        }
    };
    
    try {
        const response2 = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nonOfficialPayload)
        });
        
        const result2 = await response2.json();
        console.log('Non-official response:', result2.processed ? '❌ INCORRECTLY PROCESSED' : '✅ CORRECTLY REJECTED');
        console.log('Message:', result2.message);
        
    } catch (error) {
        console.error('❌ Error testing non-official webhook:', error);
    }
}

testOfficialFID().catch(console.error);