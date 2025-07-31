import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export interface RaffleConfig {
  schedule: {
    days: number[]; // [0, 3] = Sunday and Wednesday
    hour: number; // 20 = 8PM UTC
    duration: number; // 72 hours
  };
  rewards: {
    currency: string;
    distribution: {
      winners: number; // 0.9 = 90% to winners
      operations: number; // 0.1 = 10% operations
    };
    positions: Array<{
      place: number;
      percentage: number;
    }>;
  };
  bootstrap: {
    threshold: number; // 5000 = self-sustaining threshold
    minimumPool: number; // 500 = minimum guaranteed pool
  };
}

const defaultConfig: RaffleConfig = {
  schedule: {
    days: [0, 3], // Sunday and Wednesday
    hour: 20, // 8PM UTC
    duration: 72, // 72 hours
  },
  rewards: {
    currency: '$DEGEN',
    distribution: {
      winners: 0.9, // 90% to winners
      operations: 0.1 // 10% operations
    },
    positions: [
      { place: 1, percentage: 0.6 }, // 60% to 1st place
      { place: 2, percentage: 0.3 }, // 30% to 2nd place  
      { place: 3, percentage: 0.1 }  // 10% to 3rd place
    ]
  },
  bootstrap: {
    threshold: 5000, // Self-sustaining threshold
    minimumPool: 500 // Bootstrap minimum
  }
};

export class RaffleService {
  private config: RaffleConfig;

  constructor(config: RaffleConfig = defaultConfig) {
    this.config = config;
  }

  /**
   * Generate week period identifier
   * Format: "2025-W31-A" (Wed), "2025-W31-B" (Sun)
   */
  private generateWeekPeriod(date: Date, isWednesday: boolean): string {
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(dayOfYear / 7);
    const suffix = isWednesday ? 'A' : 'B';
    return `${year}-W${weekNumber.toString().padStart(2, '0')}-${suffix}`;
  }

  /**
   * Calculate next raffle dates
   */
  private getNextRaffleDates(): { startDate: Date; endDate: Date; isWednesday: boolean } {
    const now = new Date();
    const { days, hour, duration } = this.config.schedule;
    
    // Find next scheduled day
    const nextStartDate = new Date(now);
    nextStartDate.setUTCHours(hour, 0, 0, 0);
    
    // If we've passed today's scheduled time, move to next day
    if (nextStartDate <= now) {
      nextStartDate.setDate(nextStartDate.getDate() + 1);
      nextStartDate.setUTCHours(hour, 0, 0, 0);
    }
    
    // Find next scheduled day (Wednesday=3 or Sunday=0)
    while (!days.includes(nextStartDate.getUTCDay())) {
      nextStartDate.setDate(nextStartDate.getDate() + 1);
    }
    
    const isWednesday = nextStartDate.getUTCDay() === 3;
    const endDate = new Date(nextStartDate.getTime() + (duration * 60 * 60 * 1000));
    
    return { startDate: nextStartDate, endDate, isWednesday };
  }

  /**
   * Create a new raffle
   */
  async createRaffle(): Promise<string> {
    const { startDate, endDate, isWednesday } = this.getNextRaffleDates();
    const weekPeriod = this.generateWeekPeriod(startDate, isWednesday);

    // Check if raffle already exists
    const existingRaffle = await prisma.raffle.findUnique({
      where: { weekPeriod }
    });

    if (existingRaffle) {
      return existingRaffle.id;
    }

    // Create new raffle
    const raffle = await prisma.raffle.create({
      data: {
        weekPeriod,
        startDate,
        endDate,
        status: 'ACTIVE'
      }
    });

    console.log(`✅ Created new raffle: ${weekPeriod} (${raffle.id})`);
    return raffle.id;
  }

  /**
   * Calculate prize pool based on tips received
   */
  async calculatePrizePool(raffleId: string): Promise<{
    tipsReceived: number;
    userContribution: number;
    founderContribution: number;
    operationalFee: number;
    totalPool: number;
    isSelfSustaining: boolean;
  }> {
    const { threshold, minimumPool } = this.config.bootstrap;
    
    // Get current raffle
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId }
    });

    if (!raffle) {
      throw new Error('Raffle not found');
    }

    // For MVP, we'll simulate tips received
    // In production, this would come from Degen tip system integration
    const tipsReceived = raffle.tipsReceived || 0;
    const userContribution = Math.floor(tipsReceived * this.config.rewards.distribution.winners);
    const operationalFee = Math.floor(tipsReceived * this.config.rewards.distribution.operations);
    
    let totalPool: number;
    let founderContribution: number;
    let isSelfSustaining: boolean;
    
    if (tipsReceived >= threshold) {
      // Self-sustaining mode
      totalPool = userContribution;
      founderContribution = 0;
      isSelfSustaining = true;
    } else {
      // Bootstrap mode
      totalPool = minimumPool + userContribution;
      founderContribution = minimumPool;
      isSelfSustaining = false;
    }

    return {
      tipsReceived,
      userContribution,
      founderContribution,
      operationalFee,
      totalPool,
      isSelfSustaining
    };
  }

  /**
   * Update raffle pool information
   */
  async updateRafflePool(raffleId: string): Promise<void> {
    const poolData = await this.calculatePrizePool(raffleId);
    
    await prisma.raffle.update({
      where: { id: raffleId },
      data: {
        tipsReceived: poolData.tipsReceived,
        userContribution: poolData.userContribution,
        founderContribution: poolData.founderContribution,
        operationalFee: poolData.operationalFee,
        totalPool: poolData.totalPool,
        isSelfSustaining: poolData.isSelfSustaining
      }
    });
  }

  /**
   * Select winners using weighted random selection
   */
  private selectWinners(participants: Array<{ userFid: bigint; tickets: number }>): {
    firstPlace?: bigint;
    secondPlace?: bigint;
    thirdPlace?: bigint;
  } {
    if (participants.length === 0) return {};

    // Create weighted array
    const weightedEntries: bigint[] = [];
    for (const participant of participants) {
      for (let i = 0; i < participant.tickets; i++) {
        weightedEntries.push(participant.userFid);
      }
    }

    if (weightedEntries.length === 0) return {};

    // Select first place
    const firstIndex = Math.floor(Math.random() * weightedEntries.length);
    const firstPlace = weightedEntries[firstIndex];

    // Remove first place winner from pool for second place
    const remainingParticipants = participants.filter(p => p.userFid !== firstPlace);
    if (remainingParticipants.length === 0) return { firstPlace };

    const secondWeightedEntries: bigint[] = [];
    for (const participant of remainingParticipants) {
      for (let i = 0; i < participant.tickets; i++) {
        secondWeightedEntries.push(participant.userFid);
      }
    }

    if (secondWeightedEntries.length === 0) return { firstPlace };

    const secondIndex = Math.floor(Math.random() * secondWeightedEntries.length);
    const secondPlace = secondWeightedEntries[secondIndex];

    // Remove second place winner for third place
    const finalParticipants = remainingParticipants.filter(p => p.userFid !== secondPlace);
    if (finalParticipants.length === 0) return { firstPlace, secondPlace };

    const thirdWeightedEntries: bigint[] = [];
    for (const participant of finalParticipants) {
      for (let i = 0; i < participant.tickets; i++) {
        thirdWeightedEntries.push(participant.userFid);
      }
    }

    if (thirdWeightedEntries.length === 0) return { firstPlace, secondPlace };

    const thirdIndex = Math.floor(Math.random() * thirdWeightedEntries.length);
    const thirdPlace = thirdWeightedEntries[thirdIndex];

    return { firstPlace, secondPlace, thirdPlace };
  }

  /**
   * Execute a raffle and select winners
   */
  async executeRaffle(raffleId: string): Promise<{
    winners: { firstPlace?: bigint; secondPlace?: bigint; thirdPlace?: bigint };
    prizes: { first: number; second: number; third: number };
  }> {
    // Get raffle
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        userTickets: {
          where: { ticketsCount: { gt: 0 } },
          include: { user: true }
        }
      }
    });

    if (!raffle) {
      throw new Error('Raffle not found');
    }

    if (raffle.status !== 'ACTIVE') {
      throw new Error('Raffle is not active');
    }

    // Update pool before execution
    const poolData = await this.calculatePrizePool(raffleId);

    // Get participants
    const participants = raffle.userTickets.map(ut => ({
      userFid: ut.userFid,
      tickets: ut.ticketsCount
    }));

    // Select winners
    const winners = this.selectWinners(participants);

    // Calculate prizes
    const { positions } = this.config.rewards;
    const distributableAmount = poolData.userContribution + poolData.founderContribution;
    
    const firstPrize = Math.floor(distributableAmount * positions[0].percentage);
    const secondPrize = Math.floor(distributableAmount * positions[1].percentage);
    const thirdPrize = Math.floor(distributableAmount * positions[2].percentage);

    // Generate random seed (in production, use Chainlink VRF)
    const randomSeed = `0x${Math.random().toString(16).substring(2)}`;

    // Update raffle with results
    await prisma.raffle.update({
      where: { id: raffleId },
      data: {
        status: 'COMPLETED',
        firstPlaceFid: winners.firstPlace,
        secondPlaceFid: winners.secondPlace,
        thirdPlaceFid: winners.thirdPlace,
        firstPrize,
        secondPrize,
        thirdPrize,
        randomSeed,
        executedAt: new Date(),
        ...poolData
      }
    });

    // Update winner statistics
    if (winners.firstPlace) {
      await prisma.user.update({
        where: { fid: winners.firstPlace },
        data: {
          totalWinnings: { increment: firstPrize }
        }
      });
    }

    if (winners.secondPlace) {
      await prisma.user.update({
        where: { fid: winners.secondPlace },
        data: {
          totalWinnings: { increment: secondPrize }
        }
      });
    }

    if (winners.thirdPlace) {
      await prisma.user.update({
        where: { fid: winners.thirdPlace },
        data: {
          totalWinnings: { increment: thirdPrize }
        }
      });
    }

    console.log(`🎉 Raffle ${raffleId} completed!`);
    console.log(`🥇 First: ${winners.firstPlace} (${firstPrize} $DEGEN)`);
    console.log(`🥈 Second: ${winners.secondPlace} (${secondPrize} $DEGEN)`);
    console.log(`🥉 Third: ${winners.thirdPlace} (${thirdPrize} $DEGEN)`);

    return {
      winners,
      prizes: { first: firstPrize, second: secondPrize, third: thirdPrize }
    };
  }

  /**
   * Ensure there's always an active raffle
   */
  async ensureActiveRaffle(): Promise<string> {
    const activeRaffle = await prisma.raffle.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });

    if (activeRaffle) {
      // Check if current raffle has ended
      if (new Date() > activeRaffle.endDate) {
        // Execute the raffle
        await this.executeRaffle(activeRaffle.id);
        // Create next raffle
        return await this.createRaffle();
      }
      return activeRaffle.id;
    }

    // No active raffle, create one
    return await this.createRaffle();
  }
}

// Export singleton instance
export const raffleService = new RaffleService();

