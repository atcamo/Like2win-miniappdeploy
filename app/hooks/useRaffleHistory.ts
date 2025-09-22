"use client";

import { useState, useEffect } from 'react';

interface RaffleWinner {
  id: string;
  weekPeriod: string;
  raffleType: string;
  dayNumber: number;
  executedAt: string;
  totalParticipants: number;
  totalTickets: number;
  totalPool: number;
  firstPlace: {
    fid: string;
    prize: number;
    winningTicket: number;
  } | null;
  secondPlace: {
    fid: string;
    prize: number;
  } | null;
  startDate: string;
  endDate: string;
  randomSeed: string;
}

interface RaffleHistoryResponse {
  success: boolean;
  message: string;
  history: RaffleWinner[];
  pagination: {
    limit: number;
    returned: number;
  };
  timestamp: string;
}

interface UseRaffleHistoryResult {
  winners: RaffleWinner[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRaffleHistory(limit: number = 5): UseRaffleHistoryResult {
  const [winners, setWinners] = useState<RaffleWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/raffle/history?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: RaffleHistoryResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch raffle history');
      }

      // Filter only raffles with winners
      const winnersData = data.history.filter(raffle => raffle.firstPlace);
      setWinners(winnersData);

    } catch (err) {
      console.error('❌ Error fetching raffle history:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setWinners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [limit]);

  return {
    winners,
    loading,
    error,
    refetch: fetchHistory
  };
}