// Award additional tickets to FID 589396 to compensate for the webhook issue
async function awardTickets589396() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    const fid = '589396';
    
    console.log(`🎫 Otorgando tickets adicionales a FID ${fid}...`);
    
    try {
        // Check current status
        const statusResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=${fid}`);
        const statusData = await statusResponse.json();
        const currentTickets = statusData.data?.user?.currentTickets || 0;
        
        console.log('   Tickets actuales:', currentTickets);
        
        // Award a few more tickets to compensate for the webhook issue
        const ticketsToAward = 3; // Reasonable amount for likes given
        
        console.log(`   Otorgando ${ticketsToAward} tickets adicionales...`);
        
        for (let i = 0; i < ticketsToAward; i++) {
            const response = await fetch(`${baseUrl}/api/test-engagement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userFid: fid,
                    raffleId: '078adf95-4cc1-4569-9343-0337eb2ba356'
                })
            });
            
            const result = await response.json();
            console.log(`   Ticket ${i + 1}: ${result.success ? '✅' : '❌'}`);
            
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Check final status
        const finalResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=${fid}`);
        const finalData = await finalResponse.json();
        const finalTickets = finalData.data?.user?.currentTickets || 0;
        
        console.log('\n✅ RESULTADO:');
        console.log('   Tickets antes:', currentTickets);
        console.log('   Tickets después:', finalTickets);
        console.log('   Tickets agregados:', finalTickets - currentTickets);
        
        console.log('\n💡 PRÓXIMOS PASOS:');
        console.log('   • Ve a https://warpcast.com/like2win');
        console.log('   • Da like a posts recientes de @like2win');
        console.log('   • Verifica si los tickets se incrementan automáticamente');
        console.log('   • Si no, el webhook necesita configuración adicional');
        
    } catch (error) {
        console.error('❌ Error otorgando tickets:', error);
    }
}

awardTickets589396();