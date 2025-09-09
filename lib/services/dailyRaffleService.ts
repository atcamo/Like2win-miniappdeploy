/**
 * Daily Raffle Service
 * In-memory storage for daily raffle tickets that resets at midnight UTC
 */

interface UserTickets {
  fid: number;
  tickets: number;
  lastActivity: string;
  engagements: string[];
}

interface DailyRaffleData {
  date: string;
  tickets: Map<number, UserTickets>;
  totalTickets: number;
  totalParticipants: number;
}

class DailyRaffleService {
  private currentData: DailyRaffleData | null = null;
  private lastResetDate: string = '';

  private getCurrentDateStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  private ensureCurrentDay() {
    const today = this.getCurrentDateStr();
    
    if (this.lastResetDate !== today || !this.currentData) {
      console.log(`🔄 Daily raffle reset: ${this.lastResetDate || 'first-run'} → ${today}`);
      
      this.currentData = {
        date: today,
        tickets: new Map<number, UserTickets>(),
        totalTickets: 0,
        totalParticipants: 0
      };
      
      this.lastResetDate = today;
    }
  }

  addTickets(userFid: number, ticketsToAdd: number, activity: string = 'participate'): UserTickets {
    this.ensureCurrentDay();
    
    const existing = this.currentData!.tickets.get(userFid);
    
    if (existing) {
      existing.tickets += ticketsToAdd;
      existing.lastActivity = new Date().toISOString();
      existing.engagements.push(activity);
    } else {
      const newUser: UserTickets = {
        fid: userFid,
        tickets: ticketsToAdd,
        lastActivity: new Date().toISOString(),
        engagements: [activity]
      };
      this.currentData!.tickets.set(userFid, newUser);
      this.currentData!.totalParticipants++;
    }
    
    this.currentData!.totalTickets += ticketsToAdd;
    
    const userTickets = this.currentData!.tickets.get(userFid)!;
    console.log(`🎫 User ${userFid}: +${ticketsToAdd} tickets (total: ${userTickets.tickets})`);
    
    return userTickets;
  }

  getUserTickets(userFid: number): UserTickets | null {
    this.ensureCurrentDay();
    return this.currentData!.tickets.get(userFid) || null;
  }

  getTotalStats(): { totalTickets: number; totalParticipants: number } {
    this.ensureCurrentDay();
    return {
      totalTickets: this.currentData!.totalTickets,
      totalParticipants: this.currentData!.totalParticipants
    };
  }

  getLeaderboard(limit: number = 50): Array<UserTickets & { rank: number; isTopThree: boolean }> {
    this.ensureCurrentDay();
    
    const sortedUsers = Array.from(this.currentData!.tickets.values())
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        isTopThree: index < 3
      }));
    
    return sortedUsers;
  }

  getRaffleInfo() {
    this.ensureCurrentDay();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Create end of day in UTC: today at 23:59:59.999 UTC
    const endOfDayUTC = new Date(`${todayStr}T23:59:59.999Z`);
    
    return {
      id: `daily-raffle-${todayStr}`,
      date: todayStr,
      weekPeriod: `Daily Raffle - ${todayStr}`,
      startDate: `${todayStr}T00:01:00.000Z`,
      endDate: endOfDayUTC.toISOString(),
      status: 'ACTIVE',
      totalTickets: this.currentData!.totalTickets,
      totalParticipants: this.currentData!.totalParticipants,
      timeRemaining: {
        total: Math.max(0, endOfDayUTC.getTime() - now.getTime()),
        hours: Math.floor(Math.max(0, endOfDayUTC.getTime() - now.getTime()) / (1000 * 60 * 60)),
        minutes: Math.floor((Math.max(0, endOfDayUTC.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60))
      }
    };
  }

  // Remove a specific user (for cleaning mock data)
  removeUser(userFid: number): boolean {
    this.ensureCurrentDay();
    
    const user = this.currentData!.tickets.get(userFid);
    if (user) {
      this.currentData!.totalTickets -= user.tickets;
      this.currentData!.totalParticipants--;
      this.currentData!.tickets.delete(userFid);
      
      console.log(`🗑️ Removed user ${userFid} (had ${user.tickets} tickets)`);
      return true;
    }
    
    return false;
  }

  // Clear all mock users (12345, 67890, etc.)
  clearMockUsers(): number {
    this.ensureCurrentDay();
    
    const mockFids = [12345, 67890, 11111, 22222, 99999, 123456, 546204, 999999, 987654, 999888];
    let removedCount = 0;
    
    mockFids.forEach(fid => {
      if (this.removeUser(fid)) {
        removedCount++;
      }
    });
    
    console.log(`🧹 Cleared ${removedCount} mock users from daily raffle`);
    return removedCount;
  }

  // Debug method
  getDebugInfo() {
    this.ensureCurrentDay();
    return {
      currentDate: this.getCurrentDateStr(),
      lastResetDate: this.lastResetDate,
      totalParticipants: this.currentData!.totalParticipants,
      totalTickets: this.currentData!.totalTickets,
      users: Array.from(this.currentData!.tickets.entries())
    };
  }
}

// Global registry to ensure singleton across Next.js hot reloads
const globalForDailyRaffle = globalThis as unknown as {
  dailyRaffleService: DailyRaffleService | undefined;
};

// Export singleton instance with hot reload protection
export const dailyRaffleService = 
  globalForDailyRaffle.dailyRaffleService ?? 
  new DailyRaffleService();

if (process.env.NODE_ENV !== 'production') {
  globalForDailyRaffle.dailyRaffleService = dailyRaffleService;
}