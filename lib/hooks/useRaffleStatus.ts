"use client";

import { useState, useEffect, useCallback } from 'react';

export interface RaffleStatusData {
  raffle: {
    id: string;
    weekPeriod: string;
    prizePool: number;
    totalParticipants: number;
    totalTickets: number;
    endDate: string;
    timeUntilEnd: string;
    isSelfSustaining: boolean;
  };
  user: {
    fid: string;
    username?: string;
    displayName?: string;
    currentTickets: number;
    probability: number;
    tipAllowanceEnabled: boolean;
    isFollowing: boolean;
    totalLifetimeTickets: number;
    totalWinnings: number;
  };
  lastWinners: Array<{
    username?: string;
    displayName?: string;
    prize: number;
    position: number;
  }>;
}

export interface ParticipationData {
  ticketAwarded: boolean;
  requiredActions: string[];
  userTickets: number;
  message: string;
  engagement: {
    hasLiked: boolean;
    hasCommented: boolean;
    hasRecasted: boolean;
    hasTipAllowance: boolean;
  };
}

export interface LeaderboardData {
  raffle: {
    id: string;
    weekPeriod: string;
    status: string;
    totalParticipants: number;
    totalTickets: number;
    prizePool: number;
    isSelfSustaining: boolean;
  };
  leaderboard: Array<{
    rank: number;
    fid?: string;
    username?: string;
    displayName?: string;
    profilePicture?: string;
    tickets: number;
    probability: number;
    totalLifetimeTickets: number;
    totalWinnings: number;
    firstLikeAt?: string;
    lastLikeAt?: string;
  }>;
  meta: {
    totalEntries: number;
    maxRank: number;
  };
}

export function useRaffleStatus(fid: number | null) {
  const [data, setData] = useState<RaffleStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!fid) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/raffle/status?fid=${fid}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch raffle status');
      }
      
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching raffle status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fid]);

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { 
    data, 
    isLoading, 
    error, 
    refresh: fetchStatus 
  };
}

export function useRaffleParticipation() {
  const [isParticipating, setIsParticipating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const participate = useCallback(async (
    userFid: number, 
    postCastHash: string, 
    engagementData: {
      has_liked?: boolean;
      has_commented?: boolean;
      has_recasted?: boolean;
      tip_allowance?: boolean;
    }
  ): Promise<ParticipationData | null> => {
    setIsParticipating(true);
    setError(null);

    try {
      const response = await fetch('/api/raffle/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_fid: userFid,
          post_cast_hash: postCastHash,
          engagement_type: 'like_comment_recast',
          engagement_data: engagementData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to participate');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error participating in raffle:', err);
      return null;
    } finally {
      setIsParticipating(false);
    }
  }, []);

  return {
    participate,
    isParticipating,
    error
  };
}

export function useLeaderboard(raffleId?: string) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = raffleId 
        ? `/api/raffle/leaderboard?raffle_id=${raffleId}`
        : '/api/raffle/leaderboard';
      
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leaderboard');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [raffleId]);

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchLeaderboard
  };
}