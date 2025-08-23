"use client";

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo 
} from '@/app/components/Like2WinComponents';

interface RaffleData {
  id: string;
  weekPeriod: string;
  startDate: string;
  endDate: string;
  status: string;
  totalTickets: number;
  totalParticipants: number;
}

interface UserTicket {
  rank: number;
  userFid: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  ticketsCount: number;
  isTopThree: boolean;
}

interface AdminStats {
  currentRaffle: RaffleData | null;
  topUsers: UserTicket[];
  totalUsers: number;
  systemHealth: {
    cache: boolean;
    database: boolean;
    background: boolean;
  };
}

const ADMIN_FIDS = ['432789']; // Lista de FIDs con permisos de admin

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [userFid, setUserFid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'admin'>('leaderboard');
  
  const isAdmin = userFid && ADMIN_FIDS.includes(userFid);

  // Calculate time left for raffle
  useEffect(() => {
    if (!stats?.currentRaffle?.endDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(stats.currentRaffle!.endDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('¡Sorteo terminado!');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [stats?.currentRaffle?.endDate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setMessage('Error cargando estadísticas');
      }
    } catch (error) {
      setMessage('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cleanTestData = async () => {
    if (!confirm('¿Estás seguro de que quieres limpiar los datos de testing?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clean_test_data' })
      });
      
      const data = await response.json();
      setMessage(data.success ? 'Datos de testing limpiados' : 'Error limpiando datos');
      
      if (data.success) {
        await loadStats(); // Reload stats
      }
    } catch (error) {
      setMessage('Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  const createNewRaffle = async () => {
    if (!confirm('¿Crear nuevo sorteo? Esto terminará el actual.')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/raffle/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_raffle' })
      });
      
      const data = await response.json();
      setMessage(data.success ? 'Nuevo sorteo creado' : 'Error creando sorteo');
      
      if (data.success) {
        await loadStats();
      }
    } catch (error) {
      setMessage('Error creando sorteo');
    } finally {
      setLoading(false);
    }
  };

  const executeRaffle = async () => {
    if (!stats?.currentRaffle?.id) return;
    if (!confirm('¿Ejecutar sorteo actual? Esta acción no se puede deshacer.')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/raffle/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'execute_raffle',
          raffle_id: stats.currentRaffle.id 
        })
      });
      
      const data = await response.json();
      setMessage(data.success ? 'Sorteo ejecutado exitosamente' : 'Error ejecutando sorteo');
      
      if (data.success) {
        await loadStats();
      }
    } catch (error) {
      setMessage('Error ejecutando sorteo');
    } finally {
      setLoading(false);
    }
  };

  // Get user FID from Farcaster Frame SDK
  useEffect(() => {
    const initFrameSDK = async () => {
      try {
        if (typeof window !== 'undefined') {
          const context = await sdk.context;
          if (context?.user?.fid) {
            setUserFid(context.user.fid.toString());
          }
        }
      } catch (error) {
        console.log('Frame SDK not available or user not connected');
      }
    };
    
    initFrameSDK();
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Like2WinCard variant="gradient" className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Like2WinLogo size="lg" animated={true} />
            <h1 className="text-3xl font-bold text-amber-800">
              Like2Win Dashboard
            </h1>
          </div>
          <p className="text-amber-700">
            {isAdmin ? 'Panel de administración completo' : 'Leaderboard del sorteo actual'}
          </p>
        </Like2WinCard>

        {/* Tabs Navigation - Only show if admin */}
        {isAdmin && (
          <Like2WinCard>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                🏆 Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                ⚙️ Admin Panel
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Conectado como admin (FID: {userFid})
            </div>
          </Like2WinCard>
        )}

        {/* Message */}
        {message && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
            <p className="text-blue-800">{message}</p>
            <button 
              onClick={() => setMessage('')}
              className="text-blue-600 text-sm mt-2 underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Tab Content */}
        {(activeTab === 'leaderboard' || !isAdmin) && (
          <>
            {/* Leaderboard Tab Content */}
            {/* Loading State for Leaderboard */}
            {loading && (
              <Like2WinCard variant="info">
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-amber-700">Cargando leaderboard...</p>
                </div>
              </Like2WinCard>
            )}

            {/* No Active Raffle - Public View */}
            {!loading && stats && !stats.currentRaffle && (
              <Like2WinCard variant="info">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎯</div>
                  <h2 className="text-xl font-semibold text-blue-800 mb-2">
                    No hay sorteo activo
                  </h2>
                  <p className="text-blue-700">
                    El leaderboard se mostrará cuando haya un sorteo activo
                  </p>
                </div>
              </Like2WinCard>
            )}

            {/* Current Raffle Info - Public View */}
            {!loading && stats?.currentRaffle && (
              <Like2WinCard variant="info">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  🎯 Sorteo Actual
                </h2>
                <div className="text-center">
                  <p className="text-blue-700 mb-2">Tiempo restante:</p>
                  <div className="text-3xl font-bold text-blue-600">
                    {timeLeft}
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    {stats.totalUsers || 0} participantes • {stats.currentRaffle?.totalTickets || 0} tickets totales
                  </p>
                </div>
              </Like2WinCard>
            )}

            {/* Leaderboard del Sorteo Actual */}
            {!loading && stats?.currentRaffle && (
              <Like2WinCard variant="success">
                <h2 className="text-xl font-semibold text-green-800 mb-4">
                  🏆 Leaderboard
                </h2>
            <div className="space-y-3">
              {(stats.topUsers || []).slice(0, 20).map((user) => {
                const medals = ['🥇', '🥈', '🥉'];
                
                return (
                  <div 
                    key={user.userFid} 
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      user.isTopThree 
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300' 
                        : 'bg-green-50 hover:bg-green-100'
                    } transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold min-w-[3rem] ${
                        user.isTopThree ? 'text-yellow-700' : 'text-green-700'
                      }`}>
                        {user.isTopThree ? medals[(user.rank || 1) - 1] : `#${user.rank || 0}`}
                      </span>
                      {user.pfpUrl && (
                        <img 
                          src={user.pfpUrl} 
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-gray-800">
                          {user.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.displayName}
                        </div>
                        {user.isTopThree && (
                          <div className="text-xs text-yellow-600 font-medium">
                            {(user.rank || 0) === 1 ? '👑 Líder del Sorteo' : 
                             (user.rank || 0) === 2 ? '🎯 Segundo Lugar' : 
                             '🔥 Tercer Lugar'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-lg ${
                        user.isTopThree ? 'text-yellow-700' : 'text-green-600'
                      }`}>
                        {user.ticketsCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(user.ticketsCount || 0) === 1 ? 'ticket' : 'tickets'}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {(!stats.topUsers || stats.topUsers.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>Aún no hay participantes en este sorteo</p>
                  <p className="text-sm">¡Sé el primero en ganar tickets!</p>
                </div>
              )}
              
              {(stats.topUsers || []).length > 20 && (
                <div className="text-center py-2 text-gray-500 border-t border-green-200">
                  <p className="text-sm">
                    ... y {stats.totalUsers - 20} participantes más
                  </p>
                </div>
              )}
            </div>
            
            {/* Leaderboard Stats */}
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalUsers || 0}
                  </div>
                  <div className="text-sm text-green-700">Participantes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.currentRaffle?.totalTickets || 0}
                  </div>
                  <div className="text-sm text-green-700">Total Tickets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {(stats.topUsers || [])[0]?.ticketsCount || 0}
                  </div>
                  <div className="text-sm text-green-700">Máx Tickets</div>
                </div>
              </div>
                </div>
              </Like2WinCard>
            )}
          </>
        )}

        {/* Admin Tab Content */}
        {activeTab === 'admin' && isAdmin && (
          <>
            {/* Admin Panel Content */}
            {/* Loading State for Admin */}
            {loading && (
              <Like2WinCard variant="info">
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-amber-700">Cargando estadísticas...</p>
                </div>
              </Like2WinCard>
            )}

            {/* No Active Raffle - Admin View */}
            {!loading && stats && !stats.currentRaffle && (
              <Like2WinCard variant="info">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎯</div>
                  <h2 className="text-xl font-semibold text-blue-800 mb-2">
                    No hay sorteo activo
                  </h2>
                  <p className="text-blue-700 mb-4">
                    Crea un nuevo sorteo para comenzar a recibir participantes
                  </p>
                  <Like2WinButton
                    variant="gradient"
                    onClick={createNewRaffle}
                    disabled={loading}
                  >
                    🎯 Crear Nuevo Sorteo
                  </Like2WinButton>
                </div>
              </Like2WinCard>
            )}

            {/* Current Raffle - Admin View */}
            {!loading && stats?.currentRaffle && (
              <Like2WinCard variant="info">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  🎯 Sorteo Activo
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><strong>Estado:</strong> {stats.currentRaffle.status}</p>
                  <p><strong>Participantes:</strong> {stats.totalUsers || 0}</p>
                  <p><strong>Inicio:</strong> {new Date(stats.currentRaffle.startDate).toLocaleDateString()}</p>
                  <p><strong>Fin:</strong> {new Date(stats.currentRaffle.endDate).toLocaleDateString()}</p>
                  <p><strong>Tiempo restante:</strong></p>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {timeLeft}
                  </div>
                </div>
              </Like2WinCard>
            )}

        {/* System Status - Simplified */}
        {!loading && stats && (
        <Like2WinCard variant="info">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            ⚡ Estado del Sistema
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">
                {stats?.systemHealth?.database ? '🟢' : '🔴'}
              </div>
              <span className="text-blue-700">
                Sistema {stats?.systemHealth?.database ? 'Operacional' : 'Con Problemas'}
              </span>
            </div>
            <div className="text-sm text-blue-600">
              Última actualización: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </Like2WinCard>
        )}

        {/* Actions */}
        <Like2WinCard variant="gradient">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">
            🔧 Acciones de Administración
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Like2WinButton
              variant="outline"
              onClick={loadStats}
              disabled={loading}
            >
              🔄 Actualizar
            </Like2WinButton>
            
            <Like2WinButton
              variant="outline"
              onClick={cleanTestData}
              disabled={loading}
            >
              🧹 Limpiar Testing
            </Like2WinButton>
            
            <Like2WinButton
              variant="gradient"
              onClick={createNewRaffle}
              disabled={loading}
            >
              🎯 Nuevo Sorteo
            </Like2WinButton>
            
            <Like2WinButton
              variant="primary"
              onClick={executeRaffle}
              disabled={loading || !stats?.currentRaffle}
            >
              🏆 Ejecutar Sorteo
            </Like2WinButton>
          </div>
        </Like2WinCard>

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-amber-700">Procesando...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}