"use client";

import { useState, useEffect } from 'react';
import { 
  MainTitle, 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo
} from '@/app/components/Like2WinComponents';

export default function SimpleLike2WinApp() {
  const [mounted, setMounted] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [userContext, setUserContext] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Simple SDK initialization without OnchainKit dependencies
    const initFarcasterSDK = () => {
      if (typeof window !== 'undefined') {
        // Check for Farcaster context first
        const checkFarcasterContext = () => {
          // Try to get context from parent frame
          try {
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ type: 'FRAME_READY' }, '*');
            }
          } catch (e) {
            console.log('No parent frame access');
          }

          // Check for MiniKit SDK
          if ((window as any).sdk?.actions?.ready) {
            (window as any).sdk.actions.ready();
            setSdkReady(true);
            console.log('Farcaster SDK ready called');
          } else {
            // Retry in 200ms
            setTimeout(checkFarcasterContext, 200);
          }
        };

        checkFarcasterContext();

        // Listen for messages from parent frame
        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'FARCASTER_USER_CONTEXT') {
            setUserContext(event.data.context);
            console.log('Received user context:', event.data.context);
          }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
      }
    };

    const cleanup = initFarcasterSDK();
    return cleanup;
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-amber-700">Loading Like2Win...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 backdrop-blur-lg border-b border-amber-200/30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Like2WinLogo size="md" animated={true} />
            <div>
              <MainTitle className="text-2xl">Like2Win</MainTitle>
              <p className="text-sm text-amber-600">
                Follow + Like = Win $DEGEN
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-amber-600">
              {sdkReady ? "✅ SDK Ready" : "⏳ Loading..."}
            </div>
            {userContext?.user?.fid && (
              <>
                <div className="font-mono text-sm text-amber-700">{userContext.user.fid}</div>
                <div className="text-xs text-amber-600">@{userContext.user.username || 'user'}</div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Hero Section */}
        <Like2WinCard variant="gradient" className="text-center">
          <div className="space-y-4">
            <div className="text-6xl animate-pulse">🎫</div>
            <MainTitle className="text-3xl">
              ¡Gana $DEGEN con tus Likes!
            </MainTitle>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              La forma más simple de ganar crypto: Follow @Like2Win + Like posts oficiales = 
              participar en sorteos bi-semanales de $DEGEN.
            </p>
            
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
              <p className="text-amber-800 font-semibold mb-3">
                🚀 ¡Bienvenido a Like2Win!
              </p>
              <Like2WinButton 
                variant="gradient" 
                size="lg"
                onClick={() => {
                  window.open('https://warpcast.com/like2win', '_blank');
                }}
              >
                Follow @Like2Win
              </Like2WinButton>
              <p className="text-xs text-amber-700 mt-2">
                Se abrirá en Farcaster para seguir
              </p>
            </div>

            {/* Debug Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-blue-800 mb-2">Debug Info</h3>
              <ul className="text-sm text-blue-600 space-y-1 text-left">
                <li>• Mounted: {mounted ? 'Yes' : 'No'}</li>
                <li>• SDK Ready: {sdkReady ? 'Yes' : 'No'}</li>
                <li>• User Context: {userContext ? 'Available' : 'None'}</li>
                <li>• Environment: {process.env.NODE_ENV}</li>
                <li>• Window SDK: {typeof window !== 'undefined' && (window as any).sdk ? 'Present' : 'Missing'}</li>
              </ul>
            </div>
          </div>
        </Like2WinCard>

        {/* How It Works */}
        <Like2WinCard title="🎯 Cómo Funciona" variant="glassmorphism">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-amber-600 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                CON Tip Allowance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Follow @Like2Win</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">❤️</span>
                  <span>Like post oficial = +1 ticket automático</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-amber-600 flex items-center gap-2">
                <span className="text-2xl">📢</span>
                SIN Tip Allowance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Follow @Like2Win</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">❤️💬🔄</span>
                  <span>Like + Comment + Recast = +1 ticket</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-4">
            <div className="text-center space-y-2">
              <p><strong>Sorteos:</strong> Miércoles y Domingo 8PM UTC</p>
              <p><strong>Premios:</strong> 60% / 30% / 10% del pool</p>
              <p><strong>Sistema:</strong> Sin wallet connection requerida</p>
            </div>
          </div>
        </Like2WinCard>

      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 backdrop-blur-lg border-t border-amber-200/30 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Like2WinLogo size="sm" animated={false} />
            <span className="font-semibold text-amber-700">Like2Win</span>
          </div>
          <p className="text-sm text-amber-600 mb-2">
            Donde cada like se convierte en una oportunidad real ✨
          </p>
          <div className="flex justify-center items-center gap-2 text-xs text-amber-600">
            <span>Built on Base</span>
            <span>•</span>
            <span>Powered by Farcaster</span>
            <span>•</span>
            <span>Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}