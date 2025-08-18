import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { PrismaClient } from '@/lib/generated/prisma';
import { neynarClient } from '@/lib/clients/neynar-client';

const prisma = new PrismaClient();

// Types for engagement detection
export interface EngagementAction {
  type: 'follow' | 'like' | 'comment' | 'recast';
  userFid: number;
  targetFid?: number; // For follows
  castHash?: string; // For likes/comments/recasts
  timestamp: Date;
}

export interface FollowAction {
  followerFid: number;
  followedFid: number;
  timestamp: Date;
}

export interface CastInteraction {
  type: 'like' | 'comment' | 'recast';
  userFid: number;
  castHash: string;
  castAuthorFid: number;
  timestamp: Date;
  content?: string; // For comments
}

export interface TicketEligibilityCheck {
  userFid: number;
  castHash: string;
  hasLiked: boolean;
  hasCommented: boolean;
  hasRecasted: boolean;
  hasTipAllowance: boolean;
  isEligibleForTicket: boolean;
  requiresMoreActions: string[];
}

export class EngagementService {
  private client: NeynarAPIClient | null = null;
  private LIKE2WIN_FID = parseInt(process.env.LIKE2WIN_FID || '0');
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const apiKey = process.env.NEYNAR_API_KEY;
      
      if (!apiKey || apiKey === 'your_neynar_api_key') {
        console.warn('Neynar API key not configured for engagement service');
        return;
      }

      const config = new Configuration({
        apiKey: apiKey,
        baseOptions: {
          headers: {
            'x-neynar-experimental': true,
          },
        },
      });

      this.client = new NeynarAPIClient(config);
      this.initialized = true;

      // Get Like2Win FID from env or search
      if (this.LIKE2WIN_FID === 0) {
        await this.findLike2WinFid();
      } else {
        console.log(`✅ Using Like2Win FID from env: ${this.LIKE2WIN_FID}`);
      }
      
      console.log('✅ Engagement Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Engagement Service:', error);
    }
  }

  private async findLike2WinFid(): Promise<void> {
    if (!this.client) return;

    try {
      // Search for Like2Win user by username
      const response = await this.client.searchUser({ q: 'like2win' });
      
      // Find exact match
      const like2winUser = response.result.users.find((user: any) => 
        user.username.toLowerCase() === 'like2win'
      );

      if (like2winUser) {
        this.LIKE2WIN_FID = like2winUser.fid;
        console.log(`✅ Found Like2Win FID: ${this.LIKE2WIN_FID}`);
      } else {
        console.warn('⚠️ Like2Win user not found, using default FID');
        // TODO: Set a default FID or throw error
      }
    } catch (error) {
      console.error('Error finding Like2Win FID:', error);
    }
  }

  /**
   * Check if a user is following @Like2Win
   */
  async checkUserFollowsLike2Win(userFid: number): Promise<boolean> {
    if (!this.client || !this.LIKE2WIN_FID) {
      console.warn('Engagement service not properly initialized');
      return false;
    }

    try {
      const response = await this.client.fetchUserFollowing({
        fid: userFid,
        limit: 100 // Check first 100 follows
      });

      const isFollowing = response.users.some((user: any) => user.fid === this.LIKE2WIN_FID);
      
      // Update database
      await this.updateUserFollowStatus(userFid, isFollowing);
      
      return isFollowing;
    } catch (error) {
      console.error(`Error checking follow status for FID ${userFid}:`, error);
      return false;
    }
  }

  /**
   * Get Like2Win official casts for engagement tracking
   */
  async getLike2WinCasts(limit: number = 10): Promise<any[]> {
    if (!this.client || !this.LIKE2WIN_FID) {
      console.warn('Cannot fetch Like2Win casts - service not initialized');
      return [];
    }

    try {
      const response = await this.client.fetchCastsForUser({
        fid: this.LIKE2WIN_FID,
        limit
      });

      return response.casts || [];
    } catch (error) {
      console.error('Error fetching Like2Win casts:', error);
      return [];
    }
  }

  /**
   * Check engagement on a specific cast
   */
  async checkCastEngagement(castHash: string, userFid: number): Promise<{
    hasLiked: boolean;
    hasCommented: boolean; 
    hasRecasted: boolean;
  }> {
    if (!this.client) {
      return { hasLiked: false, hasCommented: false, hasRecasted: false };
    }

    try {
      // For MVP, we'll use a simplified approach
      // TODO: Replace with actual Neynar API calls once we have proper methods
      console.log(`Checking engagement for cast ${castHash} by user ${userFid}`);
      
      // Placeholder implementation - always return false for now
      // This will be replaced with actual API calls once Neynar client is properly configured
      const hasLiked = false;
      const hasCommented = false;
      const hasRecasted = false;

      return { hasLiked, hasCommented, hasRecasted };
    } catch (error) {
      console.error(`Error checking engagement for cast ${castHash}:`, error);
      return { hasLiked: false, hasCommented: false, hasRecasted: false };
    }
  }

  /**
   * Check if user has tip allowance configured
   * TODO: Integrate with Degen tip system
   */
  async checkTipAllowance(userFid: number): Promise<boolean> {
    // TODO: Implement actual tip allowance detection
    // For now, return based on power badge or some heuristic
    try {
      const user = await neynarClient.getUserByFid(userFid);
      if (!user) return false;

      // Temporary heuristic: users with power badge likely have tip allowance
      // TODO: Replace with actual Degen tip allowance API
      return Boolean(user?.power_badge);
    } catch (error) {
      console.error(`Error checking tip allowance for FID ${userFid}:`, error);
      return false;
    }
  }

  /**
   * Check if user is eligible for a ticket on a specific cast
   */
  async checkTicketEligibility(userFid: number, castHash: string): Promise<TicketEligibilityCheck> {
    const engagement = await this.checkCastEngagement(castHash, userFid);
    const hasTipAllowance = await this.checkTipAllowance(userFid);
    
    let isEligibleForTicket = false;
    const requiresMoreActions: string[] = [];

    if (hasTipAllowance) {
      // With tip allowance: only like required
      isEligibleForTicket = engagement.hasLiked;
      if (!engagement.hasLiked) {
        requiresMoreActions.push('like');
      }
    } else {
      // Without tip allowance: like + comment + recast required
      const allActionsComplete = engagement.hasLiked && 
                                engagement.hasCommented && 
                                engagement.hasRecasted;
      
      isEligibleForTicket = allActionsComplete;
      
      if (!engagement.hasLiked) requiresMoreActions.push('like');
      if (!engagement.hasCommented) requiresMoreActions.push('comment');
      if (!engagement.hasRecasted) requiresMoreActions.push('recast');
    }

    return {
      userFid,
      castHash,
      hasLiked: engagement.hasLiked,
      hasCommented: engagement.hasCommented,
      hasRecasted: engagement.hasRecasted,
      hasTipAllowance,
      isEligibleForTicket,
      requiresMoreActions
    };
  }

  /**
   * Process engagement and award ticket if eligible
   */
  async processEngagementForTicket(userFid: number, castHash: string): Promise<{
    success: boolean;
    ticketAwarded: boolean;
    message: string;
    eligibility: TicketEligibilityCheck;
  }> {
    try {
      // Check if user follows Like2Win
      const isFollowing = await this.checkUserFollowsLike2Win(userFid);
      if (!isFollowing) {
        return {
          success: false,
          ticketAwarded: false,
          message: 'Must follow @Like2Win to participate',
          eligibility: {} as TicketEligibilityCheck
        };
      }

      // Check engagement eligibility
      const eligibility = await this.checkTicketEligibility(userFid, castHash);
      
      if (!eligibility.isEligibleForTicket) {
        const actionsNeeded = eligibility.requiresMoreActions.join(', ');
        return {
          success: true,
          ticketAwarded: false,
          message: `Complete these actions: ${actionsNeeded}`,
          eligibility
        };
      }

      // Check if ticket already awarded for this cast
      const existingTicket = await this.checkExistingTicket(userFid, castHash);
      if (existingTicket) {
        return {
          success: true,
          ticketAwarded: false,
          message: 'Ticket already awarded for this cast',
          eligibility
        };
      }

      // Award ticket
      const ticketAwarded = await this.awardTicket(userFid, castHash, eligibility);
      
      return {
        success: true,
        ticketAwarded,
        message: ticketAwarded ? '🎫 Ticket awarded!' : 'Failed to award ticket',
        eligibility
      };

    } catch (error) {
      console.error('Error processing engagement:', error);
      return {
        success: false,
        ticketAwarded: false,
        message: 'Error processing engagement',
        eligibility: {} as TicketEligibilityCheck
      };
    }
  }

  /**
   * Update user follow status in database
   */
  private async updateUserFollowStatus(userFid: number, isFollowing: boolean): Promise<void> {
    try {
      await prisma.user.upsert({
        where: { fid: BigInt(userFid) },
        update: { 
          isFollowingLike2Win: isFollowing,
          updatedAt: new Date()
        },
        create: {
          fid: BigInt(userFid),
          isFollowingLike2Win: isFollowing,
          username: '', // Will be enriched later
          displayName: ''
        }
      });
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  }

  /**
   * Check if ticket already exists for this cast
   */
  private async checkExistingTicket(userFid: number, castHash: string): Promise<boolean> {
    try {
      const existing = await prisma.engagementLog.findUnique({
        where: {
          castHash_userFid: {
            castHash,
            userFid: BigInt(userFid)
          }
        }
      });

      return existing?.ticketAwarded || false;
    } catch (error) {
      console.error('Error checking existing ticket:', error);
      return false;
    }
  }

  /**
   * Award ticket to user
   */
  private async awardTicket(userFid: number, castHash: string, eligibility: TicketEligibilityCheck): Promise<boolean> {
    try {
      // Get current active raffle
      const activeRaffle = await prisma.raffle.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' }
      });

      if (!activeRaffle) {
        console.error('No active raffle found');
        return false;
      }

      // Create engagement log
      await prisma.engagementLog.create({
        data: {
          raffleId: activeRaffle.id,
          userFid: BigInt(userFid),
          castHash,
          hasLiked: eligibility.hasLiked,
          hasCommented: eligibility.hasCommented,
          hasRecasted: eligibility.hasRecasted,
          hasTipAllowance: eligibility.hasTipAllowance,
          ticketAwarded: true,
          ticketAwardedAt: new Date()
        }
      });

      // Update user tickets for this raffle
      await prisma.userTickets.upsert({
        where: {
          raffleId_userFid: {
            raffleId: activeRaffle.id,
            userFid: BigInt(userFid)
          }
        },
        update: {
          ticketsCount: { increment: 1 },
          lastLikeAt: new Date()
        },
        create: {
          raffleId: activeRaffle.id,
          userFid: BigInt(userFid),
          ticketsCount: 1,
          firstLikeAt: new Date(),
          lastLikeAt: new Date()
        }
      });

      // Update raffle totals
      await prisma.raffle.update({
        where: { id: activeRaffle.id },
        data: {
          totalTickets: { increment: 1 }
        }
      });

      // Update user lifetime stats
      await prisma.user.update({
        where: { fid: BigInt(userFid) },
        data: {
          totalLifetimeTickets: { increment: 1 }
        }
      });

      console.log(`✅ Ticket awarded to FID ${userFid} for cast ${castHash}`);
      return true;

    } catch (error) {
      console.error('Error awarding ticket:', error);
      return false;
    }
  }

  /**
   * Monitor new follows to @Like2Win
   * TODO: Implement webhook-based real-time monitoring
   */
  async monitorNewFollows(): Promise<void> {
    // TODO: Implement follow monitoring
    console.log('🔄 Follow monitoring not yet implemented');
  }

  /**
   * Health check
   */
  isInitialized(): boolean {
    return this.initialized && !!this.client && this.LIKE2WIN_FID > 0;
  }

  /**
   * Get Like2Win FID
   */
  getLike2WinFid(): number {
    return this.LIKE2WIN_FID;
  }
}

// Export singleton instance
export const engagementService = new EngagementService();