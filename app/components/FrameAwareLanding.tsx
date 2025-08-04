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
        <main className="pt-16 pb-8">
          {/* Like2Win Hero Section for Frame - Top Priority */}
          <section className="px-4 py-6 bg-gradient-to-br from-amber-50 to-yellow-50">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <span className="text-lg">🎫</span>
                <span>SOCIAL REWARDS</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-amber-900 mb-3">
                Like2Win
              </h2>
              <h3 className="text-xl text-amber-800 mb-4">
                Follow + Like = Win $DEGEN
              </h3>
              <p className="text-base text-amber-700 mb-6">
                Zero friction • Sorteos bi-semanales • Solo para seguidores
              </p>
              
              <div className="flex justify-center mb-6">
                <a 
                  href="/miniapp" 
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🎲 Únete al Sorteo
                </a>
              </div>
              
              <div className="flex justify-center gap-6 text-center text-sm text-amber-600 mb-6">
                <div>
                  <div className="font-bold">500+</div>
                  <div>Participants</div>
                </div>
                <div>
                  <div className="font-bold">2x/sem</div>
                  <div>Sorteos</div>
                </div>
                <div>
                  <div className="font-bold">$DEGEN</div>
                  <div>Premios</div>
                </div>
              </div>
            </div>
          </section>

          {/* Like2Win Core Value Proposition */}
          <section className="px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--app-foreground)] mb-4">
                La forma más simple de ganar{" "}
                <span className="text-[var(--app-accent)]">$DEGEN</span>
              </h1>
              <p className="text-lg text-[var(--app-foreground-muted)] mb-6">
                Solo sigue @Like2Win y dale like a posts oficiales. Zero friction, maximum fun!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <a href="/miniapp" className="bg-[var(--app-accent)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[var(--app-accent-hover)] transition-colors">
                  🎲 Participar Ahora
                </a>
                <button className="border border-[var(--app-accent)] text-[var(--app-accent)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--app-accent-light)] transition-colors">
                  Ver Estadísticas
                </button>
              </div>

              <div className="flex justify-center gap-8 text-center mb-8">
                <div>
                  <div className="text-xl font-bold text-[var(--app-foreground)]">500+</div>
                  <div className="text-sm text-[var(--app-foreground-muted)]">Participants</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[var(--app-foreground)]">2x</div>
                  <div className="text-sm text-[var(--app-foreground-muted)]">Per Week</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[var(--app-foreground)]">$DEGEN</div>
                  <div className="text-sm text-[var(--app-foreground-muted)]">Rewards</div>
                </div>
              </div>
            </div>
          </section>

          {/* Frame Actions Section */}
          <section className="px-4 py-6">
            <div className="max-w-md mx-auto">
              <FrameActions variant="full" />
            </div>
          </section>

          {/* Like2Win Features */}
          <section className="px-4 py-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-[var(--app-foreground)] mb-6">
                ¿Por qué Like2Win?
              </h2>
              
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg border-2 border-amber-300 hover:border-amber-400 transition-all hover:shadow-lg">
                  <div className="text-2xl">🎫</div>
                  <div>
                    <h3 className="font-semibold text-amber-800">Zero Friction Participation</h3>
                    <p className="text-sm text-amber-700">Solo follow + like. No wallet, no signup, no complications</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-[var(--app-card-bg)] rounded-lg border border-[var(--app-card-border)]">
                  <div className="text-2xl">💰</div>
                  <div>
                    <h3 className="font-semibold text-[var(--app-foreground)]">Real $DEGEN Rewards</h3>
                    <p className="text-sm text-[var(--app-foreground-muted)]">Sorteos bi-semanales con premios reales</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-[var(--app-card-bg)] rounded-lg border border-[var(--app-card-border)]">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h3 className="font-semibold text-[var(--app-foreground)]">Transparent Algorithm</h3>
                    <p className="text-sm text-[var(--app-foreground-muted)]">Más engagement = más tickets. Simple y justo</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-[var(--app-card-bg)] rounded-lg border border-[var(--app-card-border)]">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h3 className="font-semibold text-[var(--app-foreground)]">Farcaster Native</h3>
                    <p className="text-sm text-[var(--app-foreground-muted)]">Integrado perfectamente en tu experiencia social</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Winners */}
          <section className="px-4 py-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-[var(--app-foreground)] mb-6">
                Ganadores Recientes
              </h2>
              
              <div className="grid gap-4">
                <div className="bg-[var(--app-card-bg)] rounded-lg p-4 border border-[var(--app-card-border)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🎉</div>
                    <div>
                      <h3 className="font-semibold text-[var(--app-foreground)]">@alice.eth</h3>
                      <p className="text-sm text-[var(--app-foreground-muted)]">Sorteo #42 - Hace 3 días</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[var(--app-accent)]">2,500 $DEGEN</span>
                    <span className="text-sm text-[var(--app-foreground-muted)]">127 tickets</span>
                  </div>
                </div>

                <div className="bg-[var(--app-card-bg)] rounded-lg p-4 border border-[var(--app-card-border)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <h3 className="font-semibold text-[var(--app-foreground)]">@cryptobob</h3>
                      <p className="text-sm text-[var(--app-foreground-muted)]">Sorteo #41 - Hace 1 semana</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[var(--app-accent)]">1,800 $DEGEN</span>
                    <span className="text-sm text-[var(--app-foreground-muted)]">89 tickets</span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <a href="/miniapp" className="bg-[var(--app-accent)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--app-accent-hover)] transition-colors">
                  Ver Leaderboard
                </a>
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