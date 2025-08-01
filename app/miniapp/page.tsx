"use client";

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { 
  MainTitle, 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo,
  RaffleStatusCard,
  ParticipationButton,
  Leaderboard,
  FallingAnimation
} from '@/app/components/Like2WinComponents';
import { useRaffleStatus, useRaffleParticipation, useLeaderboard } from '@/lib/hooks/useRaffleStatus';

export default function Like2WinMiniApp() {
  const [showFallingAnimation, setShowFallingAnimation] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  // Get user FID from Frame SDK context or default to null
  const userFid = context?.user?.fid || null;

  const { data: raffleData, isLoading: raffleLoading, refresh: refreshRaffle } = useRaffleStatus(userFid);
  const { participate, isParticipating } = useRaffleParticipation();
  const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboard();

  // Initialize Frame SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const frameContext = await sdk.context;
        setContext(frameContext);
        setIsSDKLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Frame SDK:', error);
        setIsSDKLoaded(true); // Set to true anyway to show fallback UI
      }
    };

    initializeSDK();
  }, []);

  // Trigger falling animation occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        setShowFallingAnimation(true);
        setTimeout(() => setShowFallingAnimation(false), 3000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleParticipate = async (castHash: string) => {
    if (!userFid) {
      console.error('No user FID available');
      return;
    }
    
    const result = await participate(userFid, castHash, {
      has_liked: true,
      has_commented: false, // Will be detected via API
      has_recasted: false,  // Will be detected via API
      tip_allowance: raffleData?.user.tipAllowanceEnabled || false
    });

    if (result?.ticketAwarded) {
      setShowFallingAnimation(true);
      setTimeout(() => setShowFallingAnimation(false), 3000);
      refreshRaffle(); // Refresh data after participation
    }
  };

  // Show loading while SDK initializes
  if (!isSDKLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <div className="text-center">
          <Like2WinLogo size="lg" animated={true} />
          <p className="mt-4 text-[var(--app-foreground-muted)]">Initializing Like2Win...</p>
        </div>
      </div>
    );
  }

  // Show authentication prompt if not in frame context
  if (!context || !userFid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <div className="text-center">
          <Like2WinLogo size="lg" animated={true} />
          <MainTitle className="text-3xl mt-4">Like2Win</MainTitle>
          <p className="mt-4 text-[var(--app-foreground-muted)] max-w-md mx-auto">
            Para participar en los sorteos de $DEGEN, necesitas abrir esta app desde Farcaster.
          </p>
          <div className="mt-6 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
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

  if (raffleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <div className="text-center">
          <Like2WinLogo size="lg" animated={true} />
          <p className="mt-4 text-[var(--app-foreground-muted)]">Loading Like2Win...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 relative overflow-hidden">
      
      {/* Falling Animation */}
      {showFallingAnimation && (
        <>
          <FallingAnimation emoji="❤️" duration={3} delay={0} />
          <FallingAnimation emoji="🪙" duration={3} delay={0.5} />
          <FallingAnimation emoji="✨" duration={3} delay={1} />
          <FallingAnimation emoji="🎫" duration={3} delay={1.5} />
        </>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 backdrop-blur-lg border-b border-amber-200/30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Like2WinLogo size="md" animated={true} />
            <div>
              <MainTitle className="text-2xl">Like2Win</MainTitle>
              <p className="text-sm text-[var(--app-foreground-muted)]">
                Follow + Like = Win $DEGEN
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-[var(--app-foreground-muted)]">Your FID</div>
            <div className="font-mono text-sm text-amber-600">{userFid}</div>
            {context?.user?.username && (
              <div className="text-xs text-[var(--app-foreground-muted)]">@{context.user.username}</div>
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
            <p className="text-lg text-[var(--app-foreground-muted)] max-w-2xl mx-auto">
              La forma más simple de ganar crypto: Follow @Like2Win + Like posts oficiales = 
              participar en sorteos bi-semanales de $DEGEN.
            </p>
            
            {!raffleData?.user.isFollowing ? (
              <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 rounded-lg p-4">
                <p className="text-amber-800 dark:text-amber-200 font-semibold mb-3">
                  ⚠️ Necesitas seguir @Like2Win para participar
                </p>
                <Like2WinButton 
                  variant="gradient" 
                  size="lg"
                  onClick={() => {
                    // Open Farcaster profile for Like2Win
                    window.open('https://warpcast.com/like2win', '_blank');
                  }}
                >
                  Follow @Like2Win
                </Like2WinButton>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                  Se abrirá en Farcaster para seguir
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-green-600 font-semibold">
                  ✅ ¡Ya sigues @Like2Win! Ahora puedes participar:
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Para ganar tickets, busca posts oficiales de @Like2Win y dale like. 
                    {raffleData?.user.tipAllowanceEnabled ? 
                      ' Con tip allowance, cada like = 1 ticket automático.' : 
                      ' Sin tip allowance, necesitas like + comment + recast.'
                    }
                  </p>
                  <Like2WinButton 
                    variant="gradient" 
                    size="md"
                    onClick={() => {
                      window.open('https://warpcast.com/like2win', '_blank');
                    }}
                  >
                    Ver Posts de @Like2Win
                  </Like2WinButton>
                </div>
              </div>
            )}
          </div>
        </Like2WinCard>

        {/* Raffle Status */}
        {raffleData && (
          <RaffleStatusCard
            userTickets={raffleData.user.currentTickets}
            totalParticipants={raffleData.raffle.totalParticipants}
            prizePool={raffleData.raffle.prizePool}
            nextRaffleTime={raffleData.raffle.timeUntilEnd}
            userProbability={raffleData.user.probability}
            lastWinners={raffleData.lastWinners}
          />
        )}

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
          
          <div className="mt-6 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p><strong>Sorteos:</strong> Miércoles y Domingo 8PM UTC</p>
                <p><strong>Premios:</strong> 60% / 30% / 10% del pool</p>
                <p><strong>Pool actual:</strong> {raffleData?.raffle.prizePool || 0} $DEGEN</p>
              </div>
              <div className="space-y-1">
                <p><strong>Tu status:</strong> {' '}
                  <span className={raffleData?.user.tipAllowanceEnabled ? 'text-green-600' : 'text-amber-600'}>
                    {raffleData?.user.tipAllowanceEnabled ? 'CON tip allowance' : 'SIN tip allowance'}
                  </span>
                </p>
                <p><strong>Próximo sorteo:</strong> {raffleData?.raffle.timeUntilEnd || 'Calculando...'}</p>
                <p><strong>Participantes:</strong> {raffleData?.raffle.totalParticipants || 0}</p>
              </div>
            </div>
          </div>
        </Like2WinCard>

        {/* Leaderboard */}
        {leaderboardData && !leaderboardLoading && (
          <Leaderboard 
            participants={leaderboardData.leaderboard.map(p => ({
              fid: p.fid ? parseInt(p.fid) : undefined,
              username: p.username,
              displayName: p.displayName,
              tickets: p.tickets,
              profilePicture: p.profilePicture
            }))}
            currentUserFid={userFid}
          />
        )}

        {/* Stats */}
        {raffleData && (
          <Like2WinCard title="📊 Tus Estadísticas" variant="glassmorphism">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {raffleData.user.totalLifetimeTickets}
                </div>
                <div className="text-xs text-[var(--app-foreground-muted)]">
                  Total Tickets
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {raffleData.user.totalWinnings.toFixed(0)}
                </div>
                <div className="text-xs text-[var(--app-foreground-muted)]">
                  $DEGEN Ganados
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {raffleData.user.probability}%
                </div>
                <div className="text-xs text-[var(--app-foreground-muted)]">
                  Probabilidad
                </div>
              </div>
            </div>
          </Like2WinCard>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 backdrop-blur-lg border-t border-amber-200/30 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Like2WinLogo size="sm" animated={false} />
            <span className="font-semibold text-[var(--app-foreground)]">Like2Win</span>
          </div>
          <p className="text-sm text-[var(--app-foreground-muted)] mb-2">
            Donde cada like se convierte en una oportunidad real ✨
          </p>
          <div className="flex justify-center items-center gap-2 text-xs text-[var(--app-foreground-muted)]">
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