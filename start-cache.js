// Script para inicializar el cache system
async function startCache() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    try {
        console.log('🚀 Iniciando sistema de cache...');
        
        const response = await fetch(`${baseUrl}/api/cache/startup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Cache iniciado exitosamente!');
            console.log('📊 Detalles:', {
                backgroundSyncRunning: result.backgroundSync?.isRunning,
                initialSyncDuration: result.initialSync?.duration + 'ms',
                cacheHealthy: result.cacheHealth?.redisHealthy
            });
            
            // También verificar que funcione
            console.log('\n🧪 Probando endpoint de usuario...');
            const userTest = await fetch(`${baseUrl}/api/cache/user-status?fid=432789`);
            const userData = await userTest.json();
            
            console.log('👤 Tu estado actual:', {
                tickets: userData.data?.user?.currentTickets,
                source: userData.source,
                responseTime: 'super rápido!'
            });
            
        } else {
            console.log('❌ Error iniciando cache:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

startCache();