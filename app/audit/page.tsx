"use client";

import { useState, useEffect } from 'react';
import { 
  MainTitle, 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo 
} from '@/app/components/Like2WinComponents';

interface Winner {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  verifiedAddresses: string[];
  custodyAddress: string;
}

interface Raffle {
  id: number;
  weekPeriod: string;
  startDate: string;
  endDate: string;
  totalTickets: number;
  totalParticipants: number;
  prizeAmount: number;
  executedAt: string;
  winningTicketNumber: number;
  selectionAlgorithm: string;
  firstPlaceFid?: number;
}

interface AuditData {
  totalTickets: number;
  totalParticipants: number;
  randomNumber: number;
  winnerTicketRange: string;
  allParticipants: Array<{
    fid: number;
    tickets: number;
    probability: string;
  }>;
  selectionTimestamp: string;
  executionMethod: string;
}

interface RaffleEntry {
  raffle: Raffle;
  winner: Winner | null;
  auditTrail: AuditData | null;
}

interface AuditResponse {
  success: boolean;
  summary: {
    totalCompletedRaffles: number;
    totalPrizesDistributed: string;
    totalTicketsAllTime: number;
    totalParticipantsAllTime: number;
    averageTicketsPerRaffle: number;
    averageParticipantsPerRaffle: number;
  };
  currentActiveRaffle: any;
  historicalRaffles: RaffleEntry[];
}

export default function AuditPage() {
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRaffle, setExpandedRaffle] = useState<number | null>(null);

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    try {
      const response = await fetch('/api/audit/raffles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAuditData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Like2WinLogo size="lg" animated={true} />
          <p className="mt-4 text-amber-700">Cargando datos de auditoría...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Like2WinCard variant="warning" className="max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Error de Carga</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Like2WinButton variant="gradient" onClick={fetchAuditData}>
            Reintentar
          </Like2WinButton>
        </Like2WinCard>
      </div>
    );
  }

  if (!auditData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Like2WinLogo size="lg" animated={false} />
          <MainTitle className="text-4xl mt-4 mb-2">
            Auditoría de Sorteos
          </MainTitle>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Transparencia total: Histórico completo de ganadores, algoritmos y verificación blockchain
          </p>
        </div>

        {/* Summary Statistics */}
        <Like2WinCard variant="gradient" className="mb-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-4">📊 Estadísticas Generales</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{auditData.summary.totalCompletedRaffles}</div>
              <div className="text-sm text-amber-700">Sorteos Completados</div>
            </div>
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{auditData.summary.totalPrizesDistributed}</div>
              <div className="text-sm text-green-700">Premios Distribuidos</div>
            </div>
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{auditData.summary.totalTicketsAllTime}</div>
              <div className="text-sm text-blue-700">Tickets Totales</div>
            </div>
          </div>
          
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-purple-600">{auditData.summary.averageParticipantsPerRaffle}</div>
              <div className="text-sm text-purple-700">Promedio Participantes/Sorteo</div>
            </div>
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-orange-600">{auditData.summary.averageTicketsPerRaffle}</div>
              <div className="text-sm text-orange-700">Promedio Tickets/Sorteo</div>
            </div>
          </div>
        </Like2WinCard>

        {/* Current Active Raffle */}
        {auditData.currentActiveRaffle && (
          <Like2WinCard variant="success" className="mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-4">🎯 Sorteo Activo</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>Período:</strong> {auditData.currentActiveRaffle.weekPeriod}</p>
                <p><strong>Inicio:</strong> {formatDate(auditData.currentActiveRaffle.startDate)}</p>
                <p><strong>Fin:</strong> {formatDate(auditData.currentActiveRaffle.endDate)}</p>
              </div>
              <div>
                <p><strong>Participantes:</strong> {auditData.currentActiveRaffle.totalParticipants}</p>
                <p><strong>Tickets:</strong> {auditData.currentActiveRaffle.totalTickets}</p>
                <p className="text-green-700 font-semibold">Estado: Activo 🟢</p>
              </div>
            </div>
          </Like2WinCard>
        )}

        {/* Historical Raffles */}
        <Like2WinCard variant="default" className="mb-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-6">🏆 Historial de Ganadores</h2>
          
          {auditData.historicalRaffles.length === 0 ? (
            <p className="text-center text-amber-700 py-8">
              No hay sorteos completados aún. ¡El primer ganador será mostrado aquí!
            </p>
          ) : (
            <div className="space-y-4">
              {auditData.historicalRaffles.map((entry, index) => (
                <div key={entry.raffle.id} className="border border-amber-200 rounded-lg p-4">
                  
                  {/* Raffle Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-amber-800">
                        #{auditData.historicalRaffles.length - index} - {entry.raffle.weekPeriod}
                      </h3>
                      <p className="text-sm text-amber-600">
                        Ejecutado: {formatDate(entry.raffle.executedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">
                        {entry.raffle.prizeAmount} DEGEN
                      </div>
                      <div className="text-sm text-gray-600">
                        Premio
                      </div>
                    </div>
                  </div>

                  {/* Winner Information */}
                  {entry.winner ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-green-800 mb-2">🎉 Ganador</h4>
                      <div className="flex items-center gap-3">
                        {entry.winner.pfpUrl && (
                          <img 
                            src={entry.winner.pfpUrl} 
                            alt={entry.winner.displayName}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{entry.winner.displayName}</p>
                          <p className="text-sm text-green-600">@{entry.winner.username}</p>
                          <p className="text-xs text-gray-600">FID: {entry.winner.fid}</p>
                        </div>
                      </div>
                      
                      {entry.winner.verifiedAddresses.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">
                            Dirección verificada: {formatAddress(entry.winner.verifiedAddresses[0])}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <p className="text-gray-600">Información del ganador no disponible (FID: {entry.raffle.firstPlaceFid || 'N/A'})</p>
                    </div>
                  )}

                  {/* Raffle Stats */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="font-bold text-amber-600">{entry.raffle.totalParticipants}</div>
                      <div className="text-xs text-gray-600">Participantes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{entry.raffle.totalTickets}</div>
                      <div className="text-xs text-gray-600">Total Tickets</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">#{entry.raffle.winningTicketNumber}</div>
                      <div className="text-xs text-gray-600">Ticket Ganador</div>
                    </div>
                  </div>

                  {/* Audit Trail Toggle */}
                  {entry.auditTrail && (
                    <div className="border-t border-amber-200 pt-4">
                      <Like2WinButton
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedRaffle(
                          expandedRaffle === entry.raffle.id ? null : entry.raffle.id
                        )}
                      >
                        {expandedRaffle === entry.raffle.id ? '🔼 Ocultar' : '🔍 Ver'} Detalles de Auditoría
                      </Like2WinButton>
                      
                      {expandedRaffle === entry.raffle.id && (
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-3">📋 Detalles Técnicos</h5>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>Algoritmo:</strong> {entry.raffle.selectionAlgorithm}</p>
                              <p><strong>Número Aleatorio:</strong> {entry.auditTrail.randomNumber}</p>
                              <p><strong>Rango Ganador:</strong> {entry.auditTrail.winnerTicketRange}</p>
                              <p><strong>Método:</strong> {entry.auditTrail.executionMethod}</p>
                            </div>
                            <div>
                              <p><strong>Timestamp:</strong> {formatDate(entry.auditTrail.selectionTimestamp)}</p>
                              <p><strong>Verificado:</strong> ✅ Blockchain</p>
                              <p><strong>Transparente:</strong> ✅ Código abierto</p>
                            </div>
                          </div>
                          
                          {/* Participants Breakdown */}
                          {entry.auditTrail.allParticipants && (
                            <div className="mt-4">
                              <h6 className="font-semibold text-gray-800 mb-2">👥 Todos los Participantes</h6>
                              <div className="max-h-40 overflow-y-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="p-2 text-left">FID</th>
                                      <th className="p-2 text-left">Tickets</th>
                                      <th className="p-2 text-left">Probabilidad</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {entry.auditTrail.allParticipants.map((p) => (
                                      <tr key={p.fid} className={p.fid.toString() === entry.raffle.firstPlaceFid?.toString() ? 'bg-green-100' : ''}>
                                        <td className="p-2">{p.fid}</td>
                                        <td className="p-2">{p.tickets}</td>
                                        <td className="p-2">{p.probability}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Like2WinCard>

        {/* Transparency Notice */}
        <Like2WinCard variant="warning" className="text-center">
          <h3 className="text-lg font-bold text-amber-800 mb-3">🔍 Transparencia y Verificación</h3>
          <div className="text-amber-700 space-y-2 text-sm">
            <p>• <strong>Algoritmo abierto:</strong> Código fuente disponible y auditable</p>
            <p>• <strong>Selección aleatoria:</strong> Basada en números pseudoaleatorios verificables</p>
            <p>• <strong>Blockchain:</strong> Todas las transacciones registradas en Base Network</p>
            <p>• <strong>Datos inmutables:</strong> La información aquí mostrada es permanente</p>
          </div>
          <p className="text-xs text-amber-600 mt-4">
            Última actualización: {new Date().toLocaleString('es-ES')}
          </p>
        </Like2WinCard>

      </div>
    </div>
  );
}