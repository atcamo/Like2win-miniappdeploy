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
    console.log('🎯 useRaffleStatus.fetchStatus called with fid:', fid);
    if (!fid) {
      console.log('❌ useRaffleStatus: No fid provided');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    console.log('🔄 useRaffleStatus: Starting fetch for fid:', fid);
    
    try {
      // Use new cache endpoint for ultra-fast responses
      const url = `/api/cache/user-status?fid=${fid}`;
      console.log('🚀 useRaffleStatus: Fetching from cache endpoint:', url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('📊 useRaffleStatus: API Response:', {
        ok: response.ok,
        status: response.status,
        result: JSON.stringify(result, null, 2)
      });
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch raffle status');
      }
      
      console.log('✅ useRaffleStatus: Setting data:', JSON.stringify(result.data, null, 2));
      setData(result.data);
      console.log('🎫 useRaffleStatus: Current tickets from API:', result.data?.user?.currentTickets);
    } catch (err) {
      console.error('❌ useRaffleStatus: Error fetching raffle status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      console.log('🏁 useRaffleStatus: Fetch completed');
    }
  }, [fid]);

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 10 seconds (cache is fast!)
    const interval = setInterval(fetchStatus, 10000);
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
    console.log('🎫 useRaffleParticipation.participate called:', {
      userFid,
      postCastHash,
      engagementData
    });
    
    setIsParticipating(true);
    setError(null);

    try {
      const requestBody = {
        user_fid: userFid,
        post_cast_hash: postCastHash,
        engagement_type: 'like_comment_recast',
        engagement_data: engagementData
      };
      
      console.log('📤 useRaffleParticipation: Sending request:', requestBody);
      
      const response = await fetch('/api/raffle/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      console.log('📊 useRaffleParticipation: API Response:', {
        ok: response.ok,
        status: response.status,
        result
      });

      if (!response.ok) {
        throw new Error(result.error || 'Failed to participate');
      }

      console.log('✅ useRaffleParticipation: Success:', result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ useRaffleParticipation: Error:', err);
      setError(errorMessage);
      return null;
    } finally {
      setIsParticipating(false);
      console.log('🏁 useRaffleParticipation: Participation completed');
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
      // Use cache endpoint for leaderboard too
      const url = `/api/cache/leaderboard${raffleId ? `?raffleId=${raffleId}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leaderboard');
      }

      // Adapt cache response to expected format
      const leaderboardData = result.data?.leaderboard || [];
      const raffleData = result.data?.raffle;
      
      if (raffleData) {
        setData({
          raffle: {
            id: raffleData.id,
            weekPeriod: raffleData.weekPeriod,
            status: 'ACTIVE',
            totalParticipants: raffleData.totalParticipants || 0,
            totalTickets: raffleData.totalTickets || 0,
            prizePool: 1000, // Default prize pool
            isSelfSustaining: true
          },
          leaderboard: leaderboardData.map((entry: any) => ({
            rank: entry.rank,
            fid: entry.fid,
            tickets: entry.tickets,
            probability: 0, // Will be calculated
            totalLifetimeTickets: entry.tickets,
            totalWinnings: 0
          })),
          meta: {
            totalEntries: leaderboardData.length,
            maxRank: leaderboardData.length
          }
        });
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [raffleId]);

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 30 seconds (cache is fast!)
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchLeaderboard
  };
}