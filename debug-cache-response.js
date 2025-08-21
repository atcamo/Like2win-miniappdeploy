// Debug detallado de la respuesta del cache
async function debugCacheResponse() {
    const baseUrl = 'https://like2win-miniappdeploy.vercel.app';
    
    console.log('🔍 Debugging respuesta detallada del cache...\n');
    
    try {
        // Get raw response
        const response = await fetch(`${baseUrl}/api/cache/user-status?fid=432789`);
        
        console.log('📊 Response status:', response.status, response.statusText);
        console.log('📊 Response headers:', Object.fromEntries(response.headers));
        
        const text = await response.text();
        console.log('📝 Raw response text:', text);
        
        try {
            const json = JSON.parse(text);
            console.log('📦 Parsed JSON:', JSON.stringify(json, null, 2));
        } catch (parseError) {
            console.log('❌ JSON parse error:', parseError.message);
        }
        
        // Also test health endpoint
        console.log('\n🏥 Health check...');
        const healthResponse = await fetch(`${baseUrl}/api/cache/health`);
        const healthText = await healthResponse.text();
        console.log('🏥 Health response:', healthText);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugCacheResponse();