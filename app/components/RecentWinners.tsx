"use client";

import React from 'react';
import { useRaffleHistory } from '@/app/hooks/useRaffleHistory';

interface RecentWinnersProps {
  limit?: number;
}

export function RecentWinners({ limit = 3 }: RecentWinnersProps) {
  const { winners, loading, error, refetch } = useRaffleHistory(limit);

  // Helper function to format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  // Helper function to get random emoji for winners
  const getWinnerEmoji = (index: number) => {
    const emojis = ['🎉', '🎯', '🏆', '💫', '🌟', '🎊'];
    return emojis[index % emojis.length];
  };

  if (loading) {
    return (
      <section className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-lg">🏆</div>
              <h3 className="font-bold text-gray-800 text-sm">Ganadores Recientes</h3>
            </div>

            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="w-20 h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-lg">⚠️</div>
              <h3 className="font-bold text-gray-800 text-sm">Error al cargar ganadores</h3>
            </div>

            <p className="text-sm text-gray-600 mb-3">{error}</p>

            <button
              onClick={refetch}
              className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (winners.length === 0) {
    return (
      <section className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-lg">🎲</div>
              <h3 className="font-bold text-gray-800 text-sm">Próximamente...</h3>
            </div>

            <p className="text-sm text-gray-600 text-center">
              Aún no hay ganadores. ¡Sé el primero en participar!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-4">
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-lg">🏆</div>
            <h3 className="font-bold text-gray-800 text-sm">Ganadores Recientes</h3>
          </div>

          <div className="space-y-2">
            {winners.map((winner, index) => (
              <div key={winner.id} className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-xs">
                    {getWinnerEmoji(index)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      FID {winner.firstPlace?.fid}
                    </div>
                    <div className="text-xs text-gray-500">
                      {timeAgo(winner.executedAt)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600 text-sm">
                    {winner.firstPlace?.prize?.toLocaleString()} $DEGEN
                  </div>
                  <div className="text-xs text-gray-500">
                    Ticket #{winner.firstPlace?.winningTicket}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-green-200">
            <a
              href="/admin"
              className="block text-center text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              Ver Historial Completo →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}