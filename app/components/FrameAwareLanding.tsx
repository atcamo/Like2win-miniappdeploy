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
  MainTitle,
  Like2WinCard,
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
      <div className="min-h-screen bg-[var(--app-background)] text-[var(--app-foreground)]">
        <main className="pt-8 pb-8">

          {/* Hero Section - Like2Win Value Proposition */}
          <section className="px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <Like2WinCard variant="gradient" className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Like2WinLogo size="md" animated={true} />
                  <MainTitle className="text-3xl">Like2Win</MainTitle>
                </div>
                
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                  La forma más simple de ganar <span className="text-yellow-200">$DEGEN</span>
                </h1>
                
                <p className="text-lg text-amber-100 mb-6 leading-relaxed">
                  Solo sigue @Like2Win y dale like a posts oficiales. Zero friction, maximum fun!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <a 
                    href="/miniapp" 
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-white text-[var(--app-accent)] hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🎲 Participar Ahora
                  </a>
                  <a 
                    href="/bootcamp" 
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-transparent border-2 border-white text-white hover:bg-white hover:text-[var(--app-accent)] transition-all duration-300"
                  >
                    📊 Ver Estadísticas
                  </a>
                </div>
              </Like2WinCard>
            </div>
          </section>

          {/* Statistics Overview */}
          <section className="px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <Like2WinCard variant="glassmorphism" className="text-center">
                  <div className="text-2xl font-bold text-[var(--app-foreground)] mb-1">500+</div>
                  <div className="text-sm text-[var(--app-foreground-muted)]">Participants</div>
                </Like2WinCard>
                
                <Like2WinCard variant="glassmorphism" className="text-center">
                  <div className="text-2xl font-bold text-[var(--app-foreground)] mb-1">2x</div>
                  <div className="text-sm text-[var(--app-foreground-muted)]">Per Week</div>
                </Like2WinCard>
                
                <Like2WinCard variant="glassmorphism" className="text-center">
                  <div className="text-2xl font-bold text-[var(--app-accent)] mb-1">$DEGEN</div>
                  <div className="text-sm text-[var(--app-foreground-muted)]">Rewards</div>
                </Like2WinCard>
              </div>
            </div>
          </section>

          {/* Frame Actions Section */}
          <section className="px-4 py-8">
            <div className="max-w-md mx-auto">
              <Like2WinCard variant="default">
                <FrameActions variant="full" />
              </Like2WinCard>
            </div>
          </section>

          {/* Like2Win Features */}
          <section className="px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-[var(--app-foreground)] mb-8">
                ¿Por qué Like2Win?
              </h2>
              
              <div className="grid gap-6">
                <Like2WinCard variant="glassmorphism">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">🎫</div>
                    <div>
                      <h3 className="font-bold text-[var(--app-foreground)] mb-2">Zero Friction Participation</h3>
                      <p className="text-[var(--app-foreground-muted)]">Solo follow + like. No wallet, no signup, no complications</p>
                    </div>
                  </div>
                </Like2WinCard>
                
                <Like2WinCard variant="glassmorphism">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">💰</div>
                    <div>
                      <h3 className="font-bold text-[var(--app-foreground)] mb-2">Real $DEGEN Rewards</h3>
                      <p className="text-[var(--app-foreground-muted)]">Sorteos bi-semanales con premios reales</p>
                    </div>
                  </div>
                </Like2WinCard>
                
                <Like2WinCard variant="glassmorphism">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">📈</div>
                    <div>
                      <h3 className="font-bold text-[var(--app-foreground)] mb-2">Transparent Algorithm</h3>
                      <p className="text-[var(--app-foreground-muted)]">Más engagement = más tickets. Simple y justo</p>
                    </div>
                  </div>
                </Like2WinCard>
                
                <Like2WinCard variant="glassmorphism">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">🎯</div>
                    <div>
                      <h3 className="font-bold text-[var(--app-foreground)] mb-2">Farcaster Native</h3>
                      <p className="text-[var(--app-foreground-muted)]">Integrado perfectamente en tu experiencia social</p>
                    </div>
                  </div>
                </Like2WinCard>
              </div>
            </div>
          </section>

          {/* Recent Winners */}
          <section className="px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-[var(--app-foreground)] mb-8">
                🏆 Ganadores Recientes
              </h2>
              
              <div className="grid gap-4">
                <Like2WinCard variant="default">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎉</div>
                      <div>
                        <h3 className="font-bold text-[var(--app-foreground)]">@alice.eth</h3>
                        <p className="text-sm text-[var(--app-foreground-muted)]">Sorteo #42 - Hace 3 días</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[var(--app-accent)]">2,500 $DEGEN</div>
                      <div className="text-sm text-[var(--app-foreground-muted)]">127 tickets</div>
                    </div>
                  </div>
                </Like2WinCard>

                <Like2WinCard variant="default">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <h3 className="font-bold text-[var(--app-foreground)]">@cryptobob</h3>
                        <p className="text-sm text-[var(--app-foreground-muted)]">Sorteo #41 - Hace 1 semana</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[var(--app-accent)]">1,800 $DEGEN</div>
                      <div className="text-sm text-[var(--app-foreground-muted)]">89 tickets</div>
                    </div>
                  </div>
                </Like2WinCard>
              </div>

              <div className="text-center mt-8">
                <a 
                  href="/bootcamp" 
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-hover)] transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Ver Leaderboard Completo
                </a>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="px-4 py-8">
            <div className="max-w-md mx-auto">
              <Like2WinCard variant="gradient" className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  ¡Únete a Like2Win!
                </h3>
                <p className="text-amber-100 mb-6">
                  Convierte tus likes en oportunidades reales de ganar $DEGEN
                </p>
                <a 
                  href="/miniapp" 
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl bg-white text-[var(--app-accent)] hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full"
                >
                  🎲 Empezar Ahora
                </a>
              </Like2WinCard>
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