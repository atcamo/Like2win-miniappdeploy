/**
 * User Service - Resolves FIDs to usernames using Neynar API
 */

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  followerCount: number;
  followingCount: number;
}

interface UserCache {
  [fid: string]: {
    username: string;
    displayName: string;
    pfpUrl: string;
    timestamp: number;
  };
}

class UserService {
  private cache: UserCache = {};
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour cache
  private readonly NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
  private readonly NEYNAR_BASE_URL = 'https://api.neynar.com/v2';

  /**
   * Resolve multiple FIDs to user data
   */
  async resolveUsers(fids: string[]): Promise<Record<string, { username: string; displayName: string; pfpUrl: string }>> {
    const result: Record<string, { username: string; displayName: string; pfpUrl: string }> = {};
    const uncachedFids: string[] = [];

    // Check cache first
    for (const fid of fids) {
      const cached = this.cache[fid];
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        result[fid] = {
          username: cached.username,
          displayName: cached.displayName,
          pfpUrl: cached.pfpUrl
        };
      } else {
        uncachedFids.push(fid);
      }
    }

    // Fetch uncached FIDs from Neynar
    if (uncachedFids.length > 0 && this.NEYNAR_API_KEY) {
      try {
        const users = await this.fetchUsersFromNeynar(uncachedFids);
        
        for (const user of users) {
          const fid = user.fid.toString();
          const userData = {
            username: user.username || `fid${user.fid}`,
            displayName: user.displayName || `User ${user.fid}`,
            pfpUrl: user.pfpUrl || ''
          };
          
          // Cache the result
          this.cache[fid] = {
            ...userData,
            timestamp: Date.now()
          };
          
          result[fid] = userData;
        }
      } catch (error) {
        console.error('Error fetching users from Neynar:', error);
        
        // Fallback to FID display for failed lookups
        for (const fid of uncachedFids) {
          result[fid] = {
            username: `fid${fid}`,
            displayName: `User ${fid}`,
            pfpUrl: ''
          };
        }
      }
    } else {
      // No API key or empty list - use fallback
      for (const fid of uncachedFids) {
        result[fid] = {
          username: `fid${fid}`,
          displayName: `User ${fid}`,
          pfpUrl: ''
        };
      }
    }

    return result;
  }

  /**
   * Fetch users from Neynar API
   */
  private async fetchUsersFromNeynar(fids: string[]): Promise<FarcasterUser[]> {
    if (!this.NEYNAR_API_KEY) {
      throw new Error('NEYNAR_API_KEY not configured');
    }

    // Neynar bulk user endpoint
    const fidsParam = fids.join(',');
    const url = `${this.NEYNAR_BASE_URL}/farcaster/user/bulk?fids=${fidsParam}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Api-Key': this.NEYNAR_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Neynar response to our format
    return (data.users || []).map((user: any) => ({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      followerCount: user.follower_count || 0,
      followingCount: user.following_count || 0
    }));
  }

  /**
   * Resolve a single FID to user data
   */
  async resolveUser(fid: string): Promise<{ username: string; displayName: string; pfpUrl: string }> {
    const users = await this.resolveUsers([fid]);
    return users[fid] || {
      username: `fid${fid}`,
      displayName: `User ${fid}`,
      pfpUrl: ''
    };
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; oldestEntry: number | null } {
    const entries = Object.values(this.cache);
    return {
      size: entries.length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null
    };
  }
}

export const userService = new UserService();