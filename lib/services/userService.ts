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
  private readonly NEYNAR_BASE_URL = 'https://api.neynar.com/v2';
  
  private get NEYNAR_API_KEY() {
    return process.env.NEYNAR_API_KEY;
  }

  /**
   * Resolve multiple FIDs to user data
   */
  async resolveUsers(fids: string[]): Promise<Record<string, { username: string; displayName: string; pfpUrl: string }>> {
    // Debug logging for API key status
    console.log('🔍 UserService Debug:', {
      hasApiKey: !!this.NEYNAR_API_KEY,
      apiKeyLength: this.NEYNAR_API_KEY?.length || 0,
      fidsToResolve: fids.length,
      apiKeyPreview: this.NEYNAR_API_KEY ? `${this.NEYNAR_API_KEY.substring(0, 4)}...${this.NEYNAR_API_KEY.substring(this.NEYNAR_API_KEY.length - 4)}` : 'none'
    });
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
        console.error('❌ Error fetching users from Neynar:', error);
        console.error('🔍 API Key available:', !!this.NEYNAR_API_KEY);
        console.error('📋 Uncached FIDs:', uncachedFids);
        
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
    
    console.log('🌐 Making Neynar API request:', {
      url,
      fidsCount: fids.length,
      hasApiKey: !!this.NEYNAR_API_KEY
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Api-Key': this.NEYNAR_API_KEY!
      }
    });

    console.log('📡 Neynar API response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Neynar API error response:', errorText);
      throw new Error(`Neynar API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('📋 Neynar API data:', {
      usersCount: data.users?.length || 0,
      hasUsers: !!(data.users && data.users.length > 0),
      sampleUser: data.users?.[0] ? {
        fid: data.users[0].fid,
        username: data.users[0].username,
        displayName: data.users[0].display_name
      } : null
    });
    
    // Transform Neynar response to our format
    const users = (data.users || []).map((user: any) => ({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      followerCount: user.follower_count || 0,
      followingCount: user.following_count || 0
    }));
    
    console.log('✅ Transformed users:', users.length);
    return users;
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