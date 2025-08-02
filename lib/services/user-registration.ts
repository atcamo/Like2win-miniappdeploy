// SERVER-SIDE ONLY - Do not import in client components
import { neynarClient, type NeynarUserEnriched } from '@/lib/clients/neynar-client';
import { userService } from '@/lib/db';
import type { User } from '@/lib/generated/prisma';

// Types matching MiniKit frame context
interface MiniKitUser {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface FrameContext {
  user?: MiniKitUser;
  [key: string]: unknown;
}

interface NFTAwardContext {
  walletAddress: string;
  tokenId: string;
  commitmentScore?: number;
  farcasterContext?: FrameContext | null;
}

interface UserRegistrationData {
  appWallet: string;
  nftTokenId: string;
  completionDate: Date;
  commitmentScore?: number;
  
  // Like2Win specific fields
  fid?: number;
  pfpUrl?: string;
  tipAllowanceEnabled?: boolean;
  isFollowingLike2Win?: boolean;
  
  // Farcaster data
  farcasterId?: string;
  farcasterUsername?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  farcasterCustody?: string;
  farcasterVerified?: boolean;
  followerCount?: number;
  followingCount?: number;
  powerBadge?: boolean;
  verifiedAddresses?: { eth?: string[]; sol?: string[] };
}

export class UserRegistrationService {
  /**
   * Main registration method called when NFT is awarded
   */
  async registerUserOnNFTAward(context: NFTAwardContext): Promise<User> {
    const { walletAddress, tokenId, commitmentScore, farcasterContext } = context;
    
    console.log('Starting user registration for NFT award:', {
      walletAddress,
      tokenId,
      hasFarcasterContext: !!farcasterContext
    });

    try {
      // Step 1: Extract basic Farcaster data from MiniKit
      const basicFarcasterData = this.extractMiniKitData(farcasterContext);
      console.log('Extracted MiniKit data:', basicFarcasterData);
      
      // Step 2: Enrich with Neynar API if FID available
      let enrichedData: NeynarUserEnriched | null = null;
      if (basicFarcasterData?.fid) {
        console.log('Attempting to enrich profile with Neynar for FID:', basicFarcasterData.fid);
        enrichedData = await neynarClient.enrichUserProfile(basicFarcasterData.fid);
        
        if (enrichedData) {
          console.log('Successfully enriched profile data');
        } else {
          console.log('Neynar enrichment returned null, continuing with basic data');
        }
      } else {
        // Try to find user by wallet if no FID
        console.log('No FID available, attempting to find user by wallet address');
        enrichedData = await neynarClient.enrichUserProfileByWallet(walletAddress);
      }
      
      // Step 3: Prepare user data for database
      const userData = this.prepareUserData({
        walletAddress,
        tokenId,
        commitmentScore,
        basicData: basicFarcasterData,
        enrichedData
      });
      
      // Step 4: Create or update user record
      const user = await this.upsertUser(userData);
      
      console.log('User registration successful:', {
        userId: user.id,
        username: user.username,
        hasFarcasterData: !!user.farcasterId
      });
      
      return user;
      
    } catch (error) {
      console.error('User registration failed:', error);
      
      // Fallback: Create minimal user record
      console.log('Creating fallback user record');
      return await this.createFallbackUser(walletAddress, tokenId, commitmentScore);
    }
  }

  /**
   * Extract user data from MiniKit frame context
   */
  private extractMiniKitData(context?: FrameContext | null): MiniKitUser | null {
    if (!context?.user) {
      console.log('No user data in frame context');
      return null;
    }
    
    const userData = {
      fid: context.user.fid,
      username: context.user.username,
      displayName: context.user.displayName,
      pfpUrl: context.user.pfpUrl
    };

    console.log('Extracted MiniKit user data:', userData);
    return userData;
  }

  /**
   * Prepare complete user data object for database
   */
  private prepareUserData(data: {
    walletAddress: string;
    tokenId: string;
    commitmentScore?: number;
    basicData: MiniKitUser | null;
    enrichedData: NeynarUserEnriched | null;
  }): UserRegistrationData {
    const { walletAddress, tokenId, commitmentScore, basicData, enrichedData } = data;
    
    // Prefer enriched data over basic data
    const userData: UserRegistrationData = {
      // Core NFT data
      appWallet: walletAddress.toLowerCase(),
      nftTokenId: tokenId,
      completionDate: new Date(),
      commitmentScore,
      
      // Farcaster data (enriched takes priority)
      farcasterId: enrichedData?.farcasterId || basicData?.fid?.toString(),
      farcasterUsername: enrichedData?.farcasterUsername || basicData?.username,
      username: enrichedData?.farcasterUsername || basicData?.username,
      displayName: enrichedData?.displayName || basicData?.displayName,
      bio: enrichedData?.bio,
      avatarUrl: enrichedData?.avatarUrl || basicData?.pfpUrl,
      
      // Neynar-specific data
      farcasterCustody: enrichedData?.farcasterCustody,
      farcasterVerified: enrichedData?.farcasterVerified || false,
      followerCount: enrichedData?.followerCount,
      followingCount: enrichedData?.followingCount,
      powerBadge: enrichedData?.powerBadge || false,
      verifiedAddresses: enrichedData?.verifiedAddresses,
    };

    console.log('Prepared user data for database:', {
      hasUsername: !!userData.username,
      hasFarcasterId: !!userData.farcasterId,
      hasEnrichedData: !!enrichedData
    });

    return userData;
  }

  /**
   * Create or update user in database
   */
  private async upsertUser(userData: UserRegistrationData): Promise<User> {
    // Try to find existing user by wallet address
    const existingUserByWallet = await userService.findByAppWallet(userData.appWallet);
    
    if (existingUserByWallet) {
      console.log('Found existing user by wallet, updating:', existingUserByWallet.id);
      return await userService.updateUser(existingUserByWallet.id, userData);
    }
    
    // Try by Farcaster ID if available
    if (userData.farcasterId) {
      const existingUserByFid = await userService.findByFarcasterId(userData.farcasterId);
      if (existingUserByFid) {
        console.log('Found existing user by Farcaster ID, updating:', existingUserByFid.id);
        return await userService.updateUser(existingUserByFid.id, userData);
      }
    }
    
    // Try by username if available
    if (userData.username) {
      const existingUserByUsername = await userService.findByUsername(userData.username);
      if (existingUserByUsername) {
        console.log('Found existing user by username, updating:', existingUserByUsername.id);
        // Update wallet address if not set
        return await userService.updateUser(existingUserByUsername.id, {
          ...userData,
          appWallet: existingUserByUsername.appWallet || userData.appWallet
        });
      }
    }
    
    // Create new user
    console.log('Creating new user record');
    return await userService.createUser(userData);
  }

  /**
   * Create minimal user record as fallback
   */
  private async createFallbackUser(
    walletAddress: string, 
    tokenId: string,
    commitmentScore?: number
  ): Promise<User> {
    const fallbackData = {
      appWallet: walletAddress.toLowerCase(),
      nftTokenId: tokenId,
      completionDate: new Date(),
      commitmentScore,
      username: `user_${walletAddress.slice(-8).toLowerCase()}`, // Generate basic username
      displayName: `Bootcamp Graduate`
    };

    console.log('Creating fallback user with generated username:', fallbackData.username);
    
    try {
      return await userService.createUser(fallbackData);
    } catch (error) {
      console.error('Failed to create fallback user:', error);
      throw new Error('Unable to register user');
    }
  }

  /**
   * Manual registration method (for API endpoint)
   */
  async registerUserManually(data: {
    walletAddress?: string;
    farcasterId?: string;
    farcasterUsername?: string;
    tokenId?: string;
  }): Promise<User> {
    console.log('Manual user registration requested:', data);

    // Validate input
    if (!data.walletAddress && !data.farcasterId && !data.farcasterUsername) {
      throw new Error('At least one identifier (wallet, fid, or username) is required');
    }

    let enrichedData: NeynarUserEnriched | null = null;

    // Try to enrich with Neynar
    if (data.farcasterId) {
      enrichedData = await neynarClient.enrichUserProfile(parseInt(data.farcasterId));
    } else if (data.walletAddress) {
      enrichedData = await neynarClient.enrichUserProfileByWallet(data.walletAddress);
    }

    // Prepare user data
    const userData: UserRegistrationData = {
      appWallet: data.walletAddress?.toLowerCase() || '',
      nftTokenId: data.tokenId || '',
      completionDate: data.tokenId ? new Date() : new Date(),
      
      // Use provided data or enriched data
      farcasterId: data.farcasterId || enrichedData?.farcasterId,
      farcasterUsername: data.farcasterUsername || enrichedData?.farcasterUsername,
      username: data.farcasterUsername || enrichedData?.farcasterUsername,
      displayName: enrichedData?.displayName,
      bio: enrichedData?.bio,
      avatarUrl: enrichedData?.avatarUrl,
      farcasterCustody: enrichedData?.farcasterCustody,
      farcasterVerified: enrichedData?.farcasterVerified,
      followerCount: enrichedData?.followerCount,
      followingCount: enrichedData?.followingCount,
      powerBadge: enrichedData?.powerBadge,
      verifiedAddresses: enrichedData?.verifiedAddresses,
    };

    return await this.upsertUser(userData);
  }
}

// Export singleton instance
export const userRegistrationService = new UserRegistrationService();