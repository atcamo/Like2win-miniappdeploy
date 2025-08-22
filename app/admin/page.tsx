"use client";

import { useState, useEffect } from 'react';
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
  userFid: string;
  ticketsCount: number;
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');

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

  useEffect(() => {
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
              Admin Dashboard
            </h1>
          </div>
          <p className="text-amber-700">
            Panel de administración para Like2Win
          </p>
        </Like2WinCard>

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

        {/* Current Raffle */}
        {stats?.currentRaffle && (
          <Like2WinCard variant="info">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              🎯 Sorteo Actual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Período:</strong> {stats.currentRaffle.weekPeriod}</p>
                <p><strong>Estado:</strong> {stats.currentRaffle.status}</p>
                <p><strong>Total Tickets:</strong> {stats.currentRaffle.totalTickets}</p>
                <p><strong>Participantes:</strong> {stats.currentRaffle.totalParticipants}</p>
              </div>
              <div>
                <p><strong>Inicio:</strong> {new Date(stats.currentRaffle.startDate).toLocaleDateString()}</p>
                <p><strong>Fin:</strong> {new Date(stats.currentRaffle.endDate).toLocaleDateString()}</p>
                <p><strong>Tiempo restante:</strong></p>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {timeLeft}
                </div>
              </div>
            </div>
          </Like2WinCard>
        )}

        {/* Top Users */}
        {stats?.topUsers && stats.topUsers.length > 0 && (
          <Like2WinCard variant="success">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              🏆 Top Usuarios
            </h2>
            <div className="space-y-2">
              {stats.topUsers.slice(0, 10).map((user, index) => (
                <div 
                  key={user.userFid} 
                  className="flex justify-between items-center p-2 bg-green-50 rounded"
                >
                  <span>#{index + 1} FID: {user.userFid}</span>
                  <span className="font-bold">{user.ticketsCount} tickets</span>
                </div>
              ))}
            </div>
          </Like2WinCard>
        )}

        {/* System Health */}
        {stats?.systemHealth && (
          <Like2WinCard variant="warning">
            <h2 className="text-xl font-semibold text-amber-800 mb-4">
              🏥 Estado del Sistema
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl ${stats.systemHealth.cache ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.systemHealth.cache ? '✅' : '❌'}
                </div>
                <p className="text-sm">Cache</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl ${stats.systemHealth.database ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.systemHealth.database ? '✅' : '❌'}
                </div>
                <p className="text-sm">Database</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl ${stats.systemHealth.background ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.systemHealth.background ? '✅' : '❌'}
                </div>
                <p className="text-sm">Background</p>
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
              variant="warning"
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
              variant="success"
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
      </div>
    </div>
  );
}