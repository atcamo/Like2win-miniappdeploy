import prisma from './prisma'
import type { Prisma } from './generated/prisma'

// User operations
export const userService = {
  async findByAppWallet(appWallet: string) {
    return prisma.user.findUnique({
      where: { appWallet },
    })
  },

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    })
  },

  async findByFarcasterId(farcasterId: string) {
    return prisma.user.findUnique({
      where: { farcasterId },
    })
  },

  async findByFarcasterUsername(farcasterUsername: string) {
    return prisma.user.findUnique({
      where: { farcasterUsername },
    })
  },

  async createUser(data: {
    appWallet?: string
    username?: string
    displayName?: string
    email?: string
    bio?: string
    avatarUrl?: string
    farcasterId?: string
    farcasterUsername?: string
    farcasterCustody?: string
    farcasterVerified?: boolean
    followerCount?: number
    followingCount?: number
    powerBadge?: boolean
    verifiedAddresses?: Prisma.InputJsonValue
    nftTokenId?: string
    completionDate?: Date
    commitmentScore?: number
  }) {
    return prisma.user.create({
      data,
    })
  },

  async updateUser(id: string, data: Partial<{
    username: string
    displayName: string
    email: string
    bio: string
    website: string
    avatarUrl: string
    bannerUrl: string
    metadata: string
    appWallet: string
    farcasterId: string
    farcasterUsername: string
    farcasterCustody: string
    farcasterVerified: boolean
    followerCount: number
    followingCount: number
    powerBadge: boolean
    verifiedAddresses: Prisma.InputJsonValue
    nftTokenId: string
    completionDate: Date
    commitmentScore: number
  }>) {
    return prisma.user.update({
      where: { id },
      data,
    })
  },

  async updateUserFarcasterData(id: string, data: {
    farcasterId?: string
    farcasterUsername?: string
    farcasterCustody?: string
    farcasterVerified?: boolean
    followerCount?: number
    followingCount?: number
    powerBadge?: boolean
    verifiedAddresses?: Prisma.InputJsonValue
  }) {
    return prisma.user.update({
      where: { id },
      data,
    })
  },

  async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  async getUsersByRaffleParticipation() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  async getUsersWithFarcaster() {
    return prisma.user.findMany({
      where: {
        farcasterId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getUsersWithNFT() {
    return prisma.user.findMany({
      where: {
        nftTokenId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    })
  },
}

// Project operations
export const projectService = {
  async findByUserId(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      include: {
        user: true,
        milestones: true,
        _count: {
          select: {
            weeklyUpdates: true,
            votes: true,
            engagement: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findPublicProjects() {
    return prisma.project.findMany({
      where: { 
        visibility: 'PUBLIC',
        status: 'ACTIVE',
      },
      include: {
        user: true,
        _count: {
          select: {
            weeklyUpdates: true,
            votes: true,
            engagement: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async createProject(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({
      data,
      include: {
        user: true,
      },
    })
  },

  async updateProject(id: string, data: Partial<{
    title: string
    description: string
    problemStatement: string
    solutionOverview: string
    targetMarket: string
    category: string
    visibility: 'PUBLIC' | 'PRIVATE' | 'COMMUNITY'
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
    targetEndDate: Date
  }>) {
    return prisma.project.update({
      where: { id },
      data,
    })
  },
}

// Weekly operations
export const weeklyService = {
  async createGoals(data: Prisma.WeeklyGoalCreateInput) {
    return prisma.weeklyGoal.create({
      data,
    })
  },

  async createUpdate(data: Prisma.WeeklyUpdateCreateInput) {
    return prisma.weeklyUpdate.create({
      data,
      include: {
        project: true,
        user: true,
      },
    })
  },

  async getProjectUpdates(projectId: string) {
    return prisma.weeklyUpdate.findMany({
      where: { projectId },
      include: {
        user: true,
      },
      orderBy: { weekStartDate: 'desc' },
    })
  },
}

// Engagement operations
export const engagementService = {
  async recordEngagement(data: Prisma.EngagementCreateInput) {
    return prisma.engagement.create({
      data,
    })
  },

  async getProjectEngagement(projectId: string) {
    return prisma.engagement.findMany({
      where: { projectId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },
}

// Vote operations
export const voteService = {
  async castVote(data: Prisma.VoteUncheckedCreateInput) {
    return prisma.vote.upsert({
      where: {
        projectId_userId: {
          projectId: data.projectId,
          userId: data.userId,
        },
      },
      update: {
        vote: data.vote,
        reason: data.reason,
      },
      create: data,
    })
  },

  async getProjectVotes(projectId: string) {
    return prisma.vote.findMany({
      where: { projectId },
      include: {
        user: true,
      },
    })
  },
}

export default prisma