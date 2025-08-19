'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  MainTitle, 
  Like2WinCard, 
  Like2WinLogo 
} from '@/app/components/Like2WinComponents';

interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  tickets: number;
  position: number;
  isFollowing: boolean;
  totalLikes: number;
  joinDate: string;
}

interface RaffleStats {
  totalParticipants: number;
  currentRaffleId: number;
  nextRaffleDate: string;
  totalTicketsDistributed: number;
  totalDegenAwarded: number;
  lastWinner: {
    username: string;
    amount: number;
    date: string;
  };
}

export default function Like2WinDashboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<RaffleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');
  
  const { address, isConnected } = useAccount();
  
  // Find current user in leaderboard
  const currentUser = leaderboard.find(entry => 
    entry.username.toLowerCase().includes(address?.slice(-4)?.toLowerCase() || '')
  );

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch leaderboard
      const leaderboardResponse = await fetch(`/api/raffle/leaderboard?period=${timeFilter}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData.leaderboard || []);
      }

      // Fetch raffle stats (mock data for now)
      setStats({
        totalParticipants: 547,
        currentRaffleId: 42,
        nextRaffleDate: '2025-01-08T20:00:00Z',
        totalTicketsDistributed: 12847,
        totalDegenAwarded: 45600,
        lastWinner: {
          username: '@alice.eth',
          amount: 2500,
          date: '2025-01-01T20:00:00Z'
        }
      });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
      
      // Mock data for development
      setLeaderboard([
        {
          id: '1',
          username: '@alice.eth',
          displayName: 'Alice',
          avatarUrl: '/avatars/alice.png',
          tickets: 127,
          position: 1,
          isFollowing: true,
          totalLikes: 89,
          joinDate: '2024-12-15'
        },
        {
          id: '2',
          username: '@cryptobob',
          displayName: 'CryptoBob',
          avatarUrl: '/avatars/bob.png',
          tickets: 94,
          position: 2,
          isFollowing: true,
          totalLikes: 67,
          joinDate: '2024-12-10'
        },
        {
          id: '3',
          username: '@like2winner',
          displayName: 'Like2Winner',
          avatarUrl: '/avatars/winner.png',
          tickets: 78,
          position: 3,
          isFollowing: true,
          totalLikes: 52,
          joinDate: '2024-12-08'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPositionEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-amber-700">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <MainTitle className="text-3xl sm:text-4xl text-amber-900 mb-2">Dashboard</MainTitle>
          <p className="text-base sm:text-lg text-amber-700">
            Leaderboard, estadísticas y próximos sorteos
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
            <Like2WinCard variant="gradient" className="text-center p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">{stats.totalParticipants}</div>
              <div className="text-xs sm:text-sm text-amber-700">Participantes Activos</div>
            </Like2WinCard>
            
            <Like2WinCard variant="glassmorphism" className="text-center p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">#{stats.currentRaffleId}</div>
              <div className="text-xs sm:text-sm text-amber-700">Sorteo Actual</div>
            </Like2WinCard>
            
            <Like2WinCard variant="default" className="text-center p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">{stats.totalTicketsDistributed.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-amber-700">Tickets Distribuidos</div>
            </Like2WinCard>
            
            <Like2WinCard variant="default" className="text-center p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">{stats.totalDegenAwarded.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-amber-700 font-medium">$DEGEN Otorgados</div>
            </Like2WinCard>
          </div>
        )}

        {/* Next Raffle & Last Winner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {stats && (
            <>
              <Like2WinCard variant="default" className="text-center p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-3 sm:mb-4">🎲 Próximo Sorteo</h3>
                <div className="text-xl sm:text-2xl font-bold text-amber-800 mb-2">
                  {formatDate(stats.nextRaffleDate)}
                </div>
                <p className="text-amber-700 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
                  Sorteo #{stats.currentRaffleId} • Bi-semanal
                </p>
                <a 
                  href="/miniapp" 
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Participar Ahora
                </a>
              </Like2WinCard>

              <Like2WinCard variant="glassmorphism" className="text-center p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-3 sm:mb-4">🏆 Último Ganador</h3>
                <div className="text-base sm:text-lg font-semibold text-amber-800 mb-2">
                  {stats.lastWinner.username}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-amber-900 mb-2">
                  {stats.lastWinner.amount.toLocaleString()} $DEGEN
                </div>
                <p className="text-amber-700 text-sm sm:text-base">
                  {formatDate(stats.lastWinner.date)}
                </p>
              </Like2WinCard>
            </>
          )}
        </div>

        {/* Time Filter */}
        <div className="flex justify-center mb-6 px-4">
          <div className="bg-white rounded-lg p-1 shadow-md border border-amber-300 grid grid-cols-3 gap-1 w-full max-w-lg">
            {(['week', 'month', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-1 text-center ${
                  timeFilter === filter
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'text-amber-800 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                {filter === 'week' ? 'Esta Semana' : 
                 filter === 'month' ? 'Este Mes' : 'Todo el Tiempo'}
              </button>
            ))}
          </div>
        </div>

        {/* Current User Stats */}
        {isConnected && currentUser && (
          <Like2WinCard variant="gradient" className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <span className="text-white font-bold text-lg">
                    {currentUser.displayName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white drop-shadow-sm">Tu Posición</h3>
                  <p className="text-orange-100/90 font-medium">{currentUser.username}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white drop-shadow-sm mb-1">
                  {getPositionEmoji(currentUser.position)} {currentUser.tickets} tickets
                </div>
                <p className="text-orange-100/90">{currentUser.totalLikes} likes dados</p>
              </div>
            </div>
          </Like2WinCard>
        )}

        {/* Leaderboard */}
        <Like2WinCard variant="glassmorphism" className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-amber-900">🏆 Leaderboard</h2>
            <span className="text-amber-700">
              Período: {timeFilter === 'week' ? 'Esta Semana' : 
                       timeFilter === 'month' ? 'Este Mes' : 'Todo el Tiempo'}
            </span>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
              <p className="text-red-600 text-sm mt-1">Mostrando datos de ejemplo</p>
            </div>
          )}

          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <div 
                key={entry.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-300 hover:border-amber-400 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-orange-600 min-w-[50px]">
                    {getPositionEmoji(entry.position)}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center border border-amber-200">
                    <span className="text-amber-900 font-semibold">
                      {entry.displayName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">{entry.displayName}</h3>
                    <p className="text-amber-700 text-sm">{entry.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-900">
                    {entry.tickets} tickets
                  </div>
                  <p className="text-amber-700 text-sm">
                    {entry.totalLikes} likes • Desde {formatDate(entry.joinDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && !error && (
            <div className="text-center py-8">
              <p className="text-amber-700">No hay datos disponibles para este período</p>
            </div>
          )}
        </Like2WinCard>

        {/* Call to Action */}
        <div className="text-center mb-8">
          <Like2WinCard variant="default" className="max-w-md mx-auto">
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              ¿Quieres aparecer en el leaderboard?
            </h3>
            <p className="text-amber-700 mb-6 font-medium">
              Sigue @Like2Win y participa para ganar tickets:<br/>
              • <strong>Con 🎩 DEGEN:</strong> solo like<br/>
              • <strong>Sin 🎩:</strong> like + recast + comment
            </p>
            <a 
              href="/miniapp" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              🎲 Participar en Like2Win
            </a>
          </Like2WinCard>
        </div>

      </div>
    </div>
  );
}