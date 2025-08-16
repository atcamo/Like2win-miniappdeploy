"use client";

import React, { useState, useEffect } from 'react';
import { useFarcasterFrame } from '@/app/hooks/useFarcasterFrame';
import { FrameActions } from './FrameActions';
import { FrameFallback, LoadingFallback, ConnectionFallback } from './FrameFallback';
import { isFrameEnvironment } from '@/app/lib/minikit-config';
import {
  HeroSection,
  BenefitsSection,
  HowItWorksSection,
  FAQSection,
  FinalCTASection,
  Footer,
} from './LandingComponents';
import {
  Like2WinLogo
} from './Like2WinComponents';

/**
 * Frame-aware landing page that adapts based on environment
 */
export function FrameAwareLanding() {
  const { frameInfo, frameActions } = useFarcasterFrame();
  const [isLoading, setIsLoading] = useState(true);
  const [showFrameContent, setShowFrameContent] = useState(false);
  const [forceShowLanding, setForceShowLanding] = useState(false);

  // Check environment and frame readiness
  useEffect(() => {
    const checkEnvironment = async () => {
      const isFrame = isFrameEnvironment();
      
      // Check if user wants to see Farcaster access instructions
      const urlParams = new URLSearchParams(window.location.search);
      const showFrameInfo = urlParams.get('view') === 'frame-info';
      
      setShowFrameContent(isFrame && !showFrameInfo);
      setForceShowLanding(!isFrame && !showFrameInfo);
      
      // Only simulate loading for actual frame environments with Farcaster context
      if (isFrame && !showFrameInfo && (document.referrer.includes('farcaster') || window.navigator.userAgent.includes('Farcaster'))) {
        setTimeout(() => setIsLoading(false), 1000);
      } else {
        // For regular browsers and non-Farcaster contexts, show immediately
        setIsLoading(false);
      }
    };

    checkEnvironment();
  }, []);

  // Show loading state during initialization
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Show connection error if frame failed to connect
  if (showFrameContent && frameInfo.connectionStatus === 'failed') {
    return (
      <ConnectionFallback
        onRetry={frameActions.refreshFrame}
        error="Failed to connect to Farcaster frame"
      />
    );
  }

  // Frame environment - show optimized content
  if (showFrameContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 text-gray-900">
        <main className="pt-4 pb-4">

          {/* Hero Section - Impactful & Professional */}
          <section className="px-4 py-4">
            <div className="max-w-md mx-auto">
              {/* Premium Header */}
              <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 p-[1px] rounded-2xl mb-4 shadow-xl">
                <div className="bg-white rounded-2xl p-6 relative overflow-hidden">
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Like2WinLogo size="sm" animated={true} />
                      <h1 className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Like2Win
                      </h1>
                    </div>
                    
                    <h2 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                      Convierte likes en <span className="text-amber-600">$DEGEN</span>
                    </h2>
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Sigue @Like2Win y participa en sorteos bi-semanales. Con sombrero DEGEN: solo like. Sin sombrero: like + recast + comment
                    </p>
                    
                    {/* Inline stats - more compact */}
                    <div className="flex justify-center gap-6 text-center mb-4 py-3 bg-amber-50/80 rounded-xl">
                      <div>
                        <div className="text-lg font-black text-amber-600">500+</div>
                        <div className="text-xs text-gray-500">Usuarios</div>
                      </div>
                      <div className="w-px bg-amber-200"></div>
                      <div>
                        <div className="text-lg font-black text-amber-600">2x/sem</div>
                        <div className="text-xs text-gray-500">Sorteos</div>
                      </div>
                      <div className="w-px bg-amber-200"></div>
                      <div>
                        <div className="text-lg font-black text-amber-600">$DEGEN</div>
                        <div className="text-xs text-gray-500">Premios</div>
                      </div>
                    </div>
                    
                    {/* Primary CTA */}
                    <a 
                      href="/miniapp" 
                      className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-6 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="text-lg">🎲</span> Participar Ahora
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Frame Actions - Compact Integration */}
          <section className="px-4 py-3">
            <div className="max-w-md mx-auto">
              <div className="bg-white/70 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4 shadow-sm">
                <FrameActions variant="full" />
              </div>
            </div>
          </section>

          {/* Value Props - Clean & Scannable */}
          <section className="px-4 py-4">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                ¿Por qué Like2Win?
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm border border-amber-100 rounded-xl hover:border-amber-200 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    🎫
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Zero Friction</h4>
                    <p className="text-xs text-gray-600">Solo follow + like. Sin complicaciones</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm border border-amber-100 rounded-xl hover:border-amber-200 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    💰
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Premios Reales</h4>
                    <p className="text-xs text-gray-600">$DEGEN real en tu wallet cada sorteo</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm border border-amber-100 rounded-xl hover:border-amber-200 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    📈
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Algorithm Transparente</h4>
                    <p className="text-xs text-gray-600">Más engagement = más tickets</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Winners - Social Proof */}
          <section className="px-4 py-4">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-lg">🏆</div>
                  <h3 className="font-bold text-gray-800 text-sm">Ganadores Recientes</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-xs">
                        🎉
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">@alice.eth</div>
                        <div className="text-xs text-gray-500">Hace 3 días</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-sm">2,500 $DEGEN</div>
                      <div className="text-xs text-gray-500">127 tickets</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xs">
                        🎯
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">@cryptobob</div>
                        <div className="text-xs text-gray-500">Hace 1 semana</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-sm">1,800 $DEGEN</div>
                      <div className="text-xs text-gray-500">89 tickets</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-green-200">
                  <a 
                    href="/bootcamp" 
                    className="block text-center text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                  >
                    Ver Leaderboard Completo →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA - Urgency & FOMO */}
          <section className="px-4 py-4">
            <div className="max-w-md mx-auto">
              <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[1px] rounded-2xl shadow-xl">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center relative overflow-hidden">
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-pink-100/20 to-red-100/20 animate-pulse"></div>
                  
                  <div className="relative z-10">
                    <div className="text-3xl mb-3">⚡</div>
                    <h3 className="text-lg font-black text-gray-800 mb-2">
                      Próximo Sorteo en 3 días
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      No te pierdas la oportunidad de ganar $DEGEN
                    </p>
                    
                    <div className="flex gap-3">
                      <a 
                        href="/miniapp" 
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 text-sm"
                      >
                        🚀 Empezar
                      </a>
                      <a 
                        href="/bootcamp" 
                        className="flex-1 bg-amber-100/50 backdrop-blur-sm text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-amber-200/50 transition-all duration-300 text-sm border border-amber-300/30"
                      >
                        📊 Stats
                      </a>
                    </div>
                  </div>
                  
                  {/* Sparkle effects */}
                  <div className="absolute top-2 right-2 text-yellow-400 animate-pulse">✨</div>
                  <div className="absolute bottom-2 left-2 text-yellow-400 animate-pulse" style={{animationDelay: '0.5s'}}>✨</div>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    );
  }

  // Non-frame environment - show full landing page or Farcaster instructions
  if (forceShowLanding) {
    // Show full landing page (default for regular website)
    return (
      <div className="min-h-screen bg-[var(--app-background)] text-[var(--app-foreground)]">
        <main>
          <HeroSection />
          <BenefitsSection />
          <HowItWorksSection />
          <FAQSection />
          <FinalCTASection />
        </main>
        
        <Footer />
      </div>
    );
  }

  // Show Farcaster access instructions (when ?view=frame-info)
  return (
    <FrameFallback>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <h1 className="text-4xl font-bold mb-6">Access via Farcaster Frame</h1>
          <p className="text-lg mb-8">
            This app is designed to work as a Farcaster Frame. 
            To access the full experience, visit this link through a Farcaster client.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-sm text-gray-300 mb-4">
              Or continue to the regular web version:
            </p>
            <button 
              onClick={() => setForceShowLanding(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              View Web Version
            </button>
          </div>
        </div>
      </div>
    </FrameFallback>
  );
}