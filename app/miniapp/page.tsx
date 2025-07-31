"use client";

import { useState, useEffect } from 'react';
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

// Mock FID for development - in production this would come from Farcaster context
const MOCK_USER_FID = 12345;

export default function Like2WinMiniApp() {
  const [showFallingAnimation, setShowFallingAnimation] = useState(false);
  const [mockUserFid] = useState(MOCK_USER_FID);

  const { data: raffleData, isLoading: raffleLoading, refresh: refreshRaffle } = useRaffleStatus(mockUserFid);
  const { participate, isParticipating } = useRaffleParticipation();
  const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboard();

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

  const handleParticipate = async () => {
    const mockCastHash = `0x${Math.random().toString(16).substring(2)}`;
    
    const result = await participate(mockUserFid, mockCastHash, {
      has_liked: true,
      has_commented: Math.random() > 0.5, // Random for demo
      has_recasted: Math.random() > 0.5,  // Random for demo
      tip_allowance: raffleData?.user.tipAllowanceEnabled || false
    });

    if (result?.ticketAwarded) {
      setShowFallingAnimation(true);
      setTimeout(() => setShowFallingAnimation(false), 3000);
      refreshRaffle(); // Refresh data after participation
    }
  };

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
            <div className="font-mono text-sm text-amber-600">{mockUserFid}</div>
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
                <Like2WinButton variant="gradient" size="lg">
                  Follow @Like2Win
                </Like2WinButton>
              </div>
            ) : (
              <ParticipationButton
                onParticipate={handleParticipate}
                isParticipating={isParticipating}
                userFid={mockUserFid}
                postHash="demo-post"
              />
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
            <p className="text-center text-sm">
              <strong>Sorteos:</strong> Miércoles y Domingo 8PM UTC • 
              <strong> Premios:</strong> 60% / 30% / 10% • 
              <strong> Tu status:</strong> {' '}
              <span className={raffleData?.user.tipAllowanceEnabled ? 'text-green-600' : 'text-amber-600'}>
                {raffleData?.user.tipAllowanceEnabled ? 'CON tips' : 'SIN tips'}
              </span>
            </p>
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
            currentUserFid={mockUserFid}
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