"use client";

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { 
  MainTitle, 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo
} from '@/app/components/Like2WinComponents';

// Type for MiniKit hook return value
interface MiniKitHookResult {
  setFrameReady: () => void;
  isFrameReady: boolean;
  context: {
    user?: {
      fid?: number;
      username?: string;
      displayName?: string;
    };
  } | null;
}

// Type for Farcaster SDK
interface FarcasterSDK {
  actions?: {
    ready?: () => void;
  };
}

// Extend Window interface for Farcaster SDK
declare global {
  interface Window {
    sdk?: FarcasterSDK;
  }
}

export default function Like2WinMiniApp() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always call useMiniKit at the top level
  const miniKitData = useMiniKit() as MiniKitHookResult;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        // Wait for MiniKit SDK to be available
        const initMiniKit = () => {
          if (typeof window !== 'undefined') {
            // Check if Farcaster SDK is available
            if (window.sdk) {
              console.log('Farcaster SDK detected:', window.sdk);
              
              // Call ready function if available
              if (window.sdk.actions?.ready) {
                window.sdk.actions.ready();
                console.log('Called sdk.actions.ready()');
              }
            } else {
              // Retry after a short delay
              setTimeout(initMiniKit, 100);
            }
          }
        };
        
        initMiniKit();
      } catch (err) {
        console.error('MiniKit initialization error:', err);
        setError(err instanceof Error ? err.message : 'MiniKit initialization failed');
      }
    }
  }, [mounted]);

  const { setFrameReady, isFrameReady, context } = miniKitData || {};

  // Get user FID from MiniKit context or default to null
  const userFid = context?.user?.fid || null;

  // Initialize OnchainKit Frame
  useEffect(() => {
    if (mounted && setFrameReady && !isFrameReady) {
      try {
        console.log('Calling OnchainKit setFrameReady()');
        setFrameReady();
      } catch (err) {
        console.error('setFrameReady error:', err);
        setError(err instanceof Error ? err.message : 'Failed to set frame ready');
      }
    }
  }, [setFrameReady, isFrameReady, mounted]);

  // Show loading while mounting
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Error</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <div className="space-y-2">
            <button 
              id="retry-button"
              name="retry"
              type="button"
              aria-label="Retry loading MiniApp"
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="w-full bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Retry
            </button>
            <p className="text-xs text-gray-500 text-center">
              If this persists, try opening from the Farcaster app
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show frame initialization
  if (!isFrameReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Like2WinLogo size="lg" animated={true} />
          <p className="mt-4 text-amber-700">Initializing Like2Win...</p>
          <div className="animate-pulse text-2xl mt-2">🎫</div>
        </div>
      </div>
    );
  }

  // Show authentication prompt if not in frame context
  if (!context || !userFid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <Like2WinLogo size="lg" animated={true} />
          <MainTitle className="text-3xl mt-4">Like2Win</MainTitle>
          <p className="mt-4 text-amber-700 mb-6">
            Para participar en los sorteos de $DEGEN, necesitas abrir esta app desde Farcaster.
          </p>
          <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              💡 <strong>Cómo participar:</strong><br/>
              1. Abre en Farcaster client<br/>
              2. Sigue @Like2Win<br/>
              3. Dale like a posts oficiales
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main app content
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pt-20">
        
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

        {/* Call to Action */}
        <Like2WinCard variant="gradient" className="text-center">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-amber-800">¿Listo para participar?</h3>
            <div className="space-y-2">
              <Like2WinButton 
                variant="gradient" 
                size="lg"
                onClick={() => window.open('https://warpcast.com/like2win', '_blank')}
              >
                Ver Posts de @Like2Win
              </Like2WinButton>
              <p className="text-sm text-amber-700">
                Busca posts oficiales y dale like para ganar tickets
              </p>
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