// Script para diagnosticar problemas del cache
async function diagnoseCache() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    try {
        console.log('🔍 Diagnosticando sistema de cache...\n');
        
        // 1. Health check detallado
        console.log('1️⃣ Verificando salud del cache...');
        const healthResponse = await fetch(`${baseUrl}/api/cache/health`);
        const healthData = await healthResponse.json();
        
        console.log('🏥 Estado general:', healthData.status);
        console.log('📊 Detalles:', {
            redisHealthy: healthData.cache?.redis?.healthy,
            syncRunning: healthData.cache?.sync?.isRunning,
            lastSync: healthData.cache?.sync?.lastSync,
            redisConfigured: healthData.environment?.redisUrl,
            dbConfigured: healthData.environment?.databaseUrl
        });
        
        // 2. Probar endpoint de usuario con fallback
        console.log('\n2️⃣ Probando user status...');
        const userResponse = await fetch(`${baseUrl}/api/cache/user-status?fid=432789`);
        const userData = await userResponse.json();
        
        console.log('👤 Respuesta completa:', JSON.stringify(userData, null, 2));
        
        // 3. Comparar con endpoint original
        console.log('\n3️⃣ Comparando con endpoint original...');
        const originalResponse = await fetch(`${baseUrl}/api/raffle/status-real?fid=432789`);
        const originalData = await originalResponse.json();
        
        console.log('🔄 Endpoint original:', {
            success: originalData.success,
            tickets: originalData.data?.user?.currentTickets,
            raffle: originalData.data?.raffle?.weekPeriod
        });
        
        // 4. Manual sync test
        console.log('\n4️⃣ Probando sync manual...');
        const syncResponse = await fetch(`${baseUrl}/api/cache/health`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'manual-sync' })
        });
        const syncData = await syncResponse.json();
        
        console.log('🔄 Sync manual:', {
            success: syncData.success,
            duration: syncData.duration + 'ms',
            error: syncData.error
        });
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    }
}

diagnoseCache();