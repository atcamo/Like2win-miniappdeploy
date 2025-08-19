import { useState, useEffect, useCallback } from 'react';

// Types
export interface EngagementStatus {
  userFid: number;
  isFollowing: boolean;
  hasLiked: boolean;
  hasCommented: boolean;
  hasRecasted: boolean;
  hasTipAllowance: boolean;
  isEligibleForTicket: boolean;
  requiresMoreActions: string[];
  ticketsEarned: number;
}

export interface Like2WinCast {
  hash: string;
  text: string;
  timestamp: string;
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfp: string;
  };
  engagement: {
    likes: number;
    recasts: number;
    replies: number;
  };
  embeds: unknown[];
}

export interface EngagementHookReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Follow status
  isFollowing: boolean | null;
  
  // Cast data
  casts: Like2WinCast[];
  
  // Engagement status per cast
  engagementStatus: Map<string, EngagementStatus>;
  
  // Actions
  checkFollowStatus: (userFid: number) => Promise<boolean>;
  checkCastEngagement: (userFid: number, castHash: string) => Promise<EngagementStatus>;
  processEngagement: (userFid: number, castHash: string) => Promise<{
    success: boolean;
    ticketAwarded: boolean;
    message: string;
  }>;
  loadLike2WinCasts: (limit?: number) => Promise<void>;
  refreshEngagement: () => Promise<void>;
}

export function useEngagement(): EngagementHookReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [casts, setCasts] = useState<Like2WinCast[]>([]);
  const [engagementStatus, setEngagementStatus] = useState<Map<string, EngagementStatus>>(new Map());

  // Check if user follows @Like2Win
  const checkFollowStatus = useCallback(async (userFid: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/engagement/follow?userFid=${userFid}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to check follow status');
      }
      
      const following = result.data.isFollowing;
      setIsFollowing(following);
      return following;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error checking follow status:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check engagement status for a specific cast
  const checkCastEngagement = useCallback(async (userFid: number, castHash: string): Promise<EngagementStatus> => {
    setError(null);
    
    try {
      const response = await fetch(`/api/engagement/check?userFid=${userFid}&castHash=${castHash}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to check engagement');
      }
      
      const status: EngagementStatus = {
        userFid,
        isFollowing: isFollowing || false,
        hasLiked: result.data.hasLiked,
        hasCommented: result.data.hasCommented,
        hasRecasted: result.data.hasRecasted,
        hasTipAllowance: result.data.hasTipAllowance,
        isEligibleForTicket: result.data.isEligibleForTicket,
        requiresMoreActions: result.data.requiresMoreActions,
        ticketsEarned: 0 // Will be updated when processing
      };
      
      // Update local state
      setEngagementStatus(prev => new Map(prev.set(castHash, status)));
      
      return status;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error checking cast engagement:', err);
      
      // Return default status
      return {
        userFid,
        isFollowing: isFollowing || false,
        hasLiked: false,
        hasCommented: false,
        hasRecasted: false,
        hasTipAllowance: false,
        isEligibleForTicket: false,
        requiresMoreActions: [],
        ticketsEarned: 0
      };
    }
  }, [isFollowing]);

  // Process engagement and award tickets
  const processEngagement = useCallback(async (userFid: number, castHash: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/engagement/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userFid, castHash }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process engagement');
      }
      
      // Update engagement status with latest data
      const eligibility = result.data.eligibility;
      if (eligibility) {
        const status: EngagementStatus = {
          userFid,
          isFollowing: isFollowing || false,
          hasLiked: eligibility.hasLiked,
          hasCommented: eligibility.hasCommented,
          hasRecasted: eligibility.hasRecasted,
          hasTipAllowance: eligibility.hasTipAllowance,
          isEligibleForTicket: eligibility.isEligibleForTicket,
          requiresMoreActions: eligibility.requiresMoreActions,
          ticketsEarned: result.data.ticketAwarded ? 1 : 0
        };
        
        setEngagementStatus(prev => new Map(prev.set(castHash, status)));
      }
      
      return {
        success: result.data.success,
        ticketAwarded: result.data.ticketAwarded,
        message: result.data.message
      };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error processing engagement:', err);
      
      return {
        success: false,
        ticketAwarded: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [isFollowing]);

  // Load Like2Win casts
  const loadLike2WinCasts = useCallback(async (limit: number = 10) => {
    console.log(`🚀 LOADING LIKE2WIN CASTS - Limit: ${limit}`);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📞 Making API call to /api/engagement/casts');
      const response = await fetch(`/api/engagement/casts?limit=${limit}`);
      const result = await response.json();
      
      console.log('📊 Casts API Response:', { 
        success: result.success, 
        castsCount: result.data?.casts?.length || 0,
        error: result.error 
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load casts');
      }
      
      console.log('✅ Setting casts in state:', result.data.casts.length, 'casts');
      setCasts(result.data.casts);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error loading casts:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh all engagement data
  const refreshEngagement = useCallback(async () => {
    // This will be called to refresh all data
    // For now, just clear the engagement status to force re-check
    setEngagementStatus(new Map());
  }, []);

  // Load casts only if user is following (removed automatic loading)
  // Casts will only be loaded when explicitly called from components

  return {
    // State
    isLoading,
    error,
    
    // Follow status
    isFollowing,
    
    // Cast data
    casts,
    
    // Engagement status
    engagementStatus,
    
    // Actions
    checkFollowStatus,
    checkCastEngagement,
    processEngagement,
    loadLike2WinCasts,
    refreshEngagement
  };
}