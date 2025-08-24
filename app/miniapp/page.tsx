"use client";

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { 
  MainTitle, 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo
} from '@/app/components/Like2WinComponents';
// import { EngagementTracker } from '@/app/components/EngagementTracker';
import { EngagementTracker } from '@/app/components/EngagementTracker';
import { useEngagement } from '@/lib/hooks/useEngagement';

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
  
  // Get engagement status to check if user is following
  const { isFollowing, checkFollowStatus } = useEngagement();

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

  // Check follow status when userFid is available
  useEffect(() => {
    if (userFid) {
      checkFollowStatus(userFid);
    }
  }, [userFid, checkFollowStatus]);

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
          <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 mb-4">
            <p className="text-amber-800 text-sm font-semibold mb-3">
              💡 <strong>Cómo participar:</strong>
            </p>
            <div className="grid gap-3">
              <p className="text-amber-700 text-sm">1. Abre en Farcaster client</p>
              <p className="text-amber-700 text-sm">2. Sigue @Like2Win</p>
            </div>
          </div>
          
          {/* Mini participation cards for non-frame view */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎩</span>
                <div>
                  <span className="font-bold text-purple-700">Con DEGEN:</span>
                  <span className="text-purple-600 ml-2">❤️ Solo like</span>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <div>
                  <span className="font-bold text-orange-700">Sin DEGEN:</span>
                  <span className="text-orange-600 ml-2">❤️ + 🔄 + 💬</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main app content
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pt-8 pb-20 md:pb-4">
        
        {/* Hero Section */}
        <Like2WinCard variant="gradient" className="text-center">
          <div className="space-y-4">
            <MainTitle className="text-3xl">
              ¡Gana $DEGEN con tus Likes!
            </MainTitle>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto mb-6">
              La forma más simple de ganar crypto: Follow @Like2Win y participa según tu tipo de cuenta.
            </p>
            
            {/* Participation Options Cards */}
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-6">
              {/* DEGEN Holder Option */}
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-purple-300 rounded-xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="text-4xl mb-3">🎩</div>
                  <h3 className="text-xl font-bold text-purple-800 mb-3">Con DEGEN</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 bg-white/60 rounded-lg px-4 py-2">
                      <span className="text-2xl">❤️</span>
                      <span className="font-semibold text-purple-700">Solo LIKE</span>
                    </div>
                  </div>
                  <p className="text-purple-600 text-sm mt-3">
                    ¡Súper fácil! Con sombrero DEGEN solo necesitas dar like.
                  </p>
                </div>
              </div>
              
              {/* Non-DEGEN Option */}
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-300 rounded-xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="text-4xl mb-3">👤</div>
                  <h3 className="text-xl font-bold text-orange-800 mb-3">Sin DEGEN</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 bg-white/60 rounded-lg px-3 py-1 text-sm">
                      <span className="text-lg">❤️</span>
                      <span className="font-medium text-orange-700">LIKE</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-white/60 rounded-lg px-3 py-1 text-sm">
                      <span className="text-lg">🔄</span>
                      <span className="font-medium text-orange-700">RECAST</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-white/60 rounded-lg px-3 py-1 text-sm">
                      <span className="text-lg">💬</span>
                      <span className="font-medium text-orange-700">COMMENT</span>
                    </div>
                  </div>
                  <p className="text-orange-600 text-sm mt-3">
                    Sin sombrero DEGEN necesitas las 3 acciones.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-amber-600 font-semibold">
              🎯 Sorteos bi-semanales de $DEGEN
            </p>
            
            {/* Show follow prompt only if user is not following yet */}
            {isFollowing === false && (
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
            )}
            
            {/* Show welcome message if already following */}
            {isFollowing === true && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <p className="text-green-800 font-semibold mb-2">
                  ✅ ¡Ya sigues @Like2Win!
                </p>
                <p className="text-green-700 text-sm">
                  Perfecto, ahora puedes participar en los sorteos. Busca posts oficiales y dale like para ganar tickets.
                </p>
              </div>
            )}
            
            {/* Show loading state while checking */}
            {isFollowing === null && (
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                <p className="text-blue-800 font-semibold mb-2">
                  🔍 Verificando estado de follow...
                </p>
                <div className="animate-pulse flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                  <p className="text-blue-700 text-sm">
                    Checking if you follow @Like2Win
                  </p>
                </div>
              </div>
            )}
          </div>
        </Like2WinCard>


        {/* Engagement System - Real Engagement Tracker with APIs */}
        {userFid && isFollowing === true && <EngagementTracker userFid={userFid} />}
        
        {/* Blocked feed for non-followers */}
        {userFid && isFollowing === false && (
          <Like2WinCard variant="gradient">
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-amber-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-amber-800 mb-3">
                  📋 Posts Oficiales Bloqueados
                </h3>
                <p className="text-amber-700 mb-6 max-w-md mx-auto">
                  Para ver los posts oficiales de @Like2Win y participar en los sorteos, primero necesitas seguir la cuenta.
                </p>
                <Like2WinButton 
                  variant="gradient" 
                  size="lg"
                  onClick={() => window.open('https://warpcast.com/like2win', '_blank')}
                >
                  🎯 Seguir @Like2Win
                </Like2WinButton>
              </div>
              
              {/* Preview placeholder */}
              <div className="border-t border-amber-200 pt-6">
                <div className="space-y-3 opacity-30">
                  <div className="bg-amber-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-amber-300 rounded w-24 mb-2"></div>
                        <div className="h-2 bg-amber-200 rounded w-full mb-1"></div>
                        <div className="h-2 bg-amber-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-amber-300 rounded w-24 mb-2"></div>
                        <div className="h-2 bg-amber-200 rounded w-full mb-1"></div>
                        <div className="h-2 bg-amber-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-amber-600 mt-3">
                  Vista previa de posts oficiales (disponible después de seguir)
                </p>
              </div>
            </div>
          </Like2WinCard>
        )}
        
        {/* Loading state while checking follow status */}
        {userFid && isFollowing === null && (
          <Like2WinCard variant="gradient">
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-amber-700">Verificando acceso a posts oficiales...</p>
            </div>
          </Like2WinCard>
        )}

        {/* Call to Action - Hidden since posts are shown directly below */}
        {false && isFollowing === true && (
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
        )}
        
        {/* Call to Action for non-followers - Hidden since main section handles this */}
        {false && isFollowing === false && (
          <Like2WinCard variant="gradient" className="text-center">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-amber-800">Primero debes seguir @Like2Win</h3>
              <p className="text-amber-700 text-sm">
                Para participar en los sorteos, necesitas seguir la cuenta oficial primero.
              </p>
              <Like2WinButton 
                variant="gradient" 
                size="lg"
                onClick={() => window.open('https://warpcast.com/like2win', '_blank')}
              >
                Seguir @Like2Win
              </Like2WinButton>
            </div>
          </Like2WinCard>
        )}

        {/* Save MiniApp - Simple & Clean */}
        <div className="mt-6 text-center py-3 border-t border-amber-200">
          <p className="text-amber-600 text-sm mb-3">
            💾 Guarda Like2Win para acceso rápido
          </p>
          <Like2WinButton 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined' && window.parent) {
                window.parent.postMessage({ type: 'saveMiniApp' }, '*');
              }
            }}
          >
            Guardar MiniApp
          </Like2WinButton>
        </div>

      </main>

    </div>
  );
}