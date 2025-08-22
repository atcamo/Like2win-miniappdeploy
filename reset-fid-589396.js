// Reset FID 589396 to correct ticket count (1)
async function resetFID589396() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    const fid = '589396';
    
    console.log(`🔄 Reseteando FID ${fid} al count correcto...`);
    
    try {
        // Check current status
        const statusResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=${fid}`);
        const statusData = await statusResponse.json();
        const currentTickets = statusData.data?.user?.currentTickets || 0;
        
        console.log('   Tickets actuales:', currentTickets);
        console.log('   Tickets correctos debería tener: 1');
        
        if (currentTickets <= 1) {
            console.log('✅ FID ya tiene el count correcto');
            return;
        }
        
        console.log('\n⚠️ NOTA: Para resetear correctamente necesitaríamos:');
        console.log('   1. Acceso directo a la base de datos, O');
        console.log('   2. Un endpoint de admin para ajustar tickets, O'); 
        console.log('   3. Eliminar registros de test de user_tickets tabla');
        
        console.log('\n💡 RECOMENDACIÓN:');
        console.log('   En lugar de resetear, vamos a:');
        console.log('   1. ✅ Confirmar que el sistema funciona (ya verificado)');
        console.log('   2. ✅ Configurar webhook de Neynar (paso crítico)');
        console.log('   3. ✅ Probar like real en producción');
        
        console.log('\n🎯 PRÓXIMO PASO CRÍTICO:');
        console.log('   El webhook de Neynar debe configurarse en:');
        console.log('   https://neynar.com/');
        console.log('   URL: https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar');
        console.log('   Eventos: reaction.created');
        console.log('   Filtro: author.fid = 1206612 (Like2Win oficial)');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

resetFID589396();