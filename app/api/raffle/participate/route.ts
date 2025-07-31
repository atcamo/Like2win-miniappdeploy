import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// POST /api/raffle/participate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_fid, post_cast_hash, engagement_type, engagement_data } = body;

    // Validate required fields
    if (!user_fid || !post_cast_hash || !engagement_type) {
      return NextResponse.json(
        { error: 'Missing required fields: user_fid, post_cast_hash, engagement_type' },
        { status: 400 }
      );
    }

    const fid = BigInt(user_fid);

    // Get current active raffle
    const currentRaffle = await prisma.raffle.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });

    if (!currentRaffle) {
      return NextResponse.json(
        { error: 'No active raffle found' },
        { status: 404 }
      );
    }

    // Check if raffle has ended
    if (new Date() > currentRaffle.endDate) {
      return NextResponse.json(
        { error: 'Raffle has ended' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { fid }
    });

    if (!user) {
      // Create user if doesn't exist (would typically come from Farcaster API)
      user = await prisma.user.create({
        data: {
          fid,
          username: `user_${fid}`,
          displayName: `User ${fid}`,
          isFollowingLike2Win: true, // Assume following if participating
          tipAllowanceEnabled: engagement_data?.tip_allowance || false
        }
      });
    }

    // Check if user is following Like2Win
    if (!user.isFollowingLike2Win) {
      return NextResponse.json(
        { error: 'User must follow @Like2Win to participate' },
        { status: 400 }
      );
    }

    // Check if user already engaged with this post
    const existingEngagement = await prisma.engagementLog.findUnique({
      where: {
        castHash_userFid: {
          castHash: post_cast_hash,
          userFid: fid
        }
      }
    });

    if (existingEngagement && existingEngagement.ticketAwarded) {
      return NextResponse.json(
        { error: 'User already participated in this post' },
        { status: 400 }
      );
    }

    // Determine if ticket should be awarded based on engagement type and tip allowance
    let ticketAwarded = false;
    const requiredActions: string[] = [];

    if (user.tipAllowanceEnabled) {
      // Users with tip allowance only need to like
      if (engagement_data?.has_liked) {
        ticketAwarded = true;
      } else {
        requiredActions.push('like');
      }
    } else {
      // Users without tip allowance need like + comment + recast
      const hasLiked = engagement_data?.has_liked || false;
      const hasCommented = engagement_data?.has_commented || false;
      const hasRecasted = engagement_data?.has_recasted || false;

      if (hasLiked && hasCommented && hasRecasted) {
        ticketAwarded = true;
      } else {
        if (!hasLiked) requiredActions.push('like');
        if (!hasCommented) requiredActions.push('comment');
        if (!hasRecasted) requiredActions.push('recast');
      }
    }

    // Create or update engagement log
    await prisma.engagementLog.upsert({
      where: {
        castHash_userFid: {
          castHash: post_cast_hash,
          userFid: fid
        }
      },
      update: {
        hasLiked: engagement_data?.has_liked || false,
        hasCommented: engagement_data?.has_commented || false,
        hasRecasted: engagement_data?.has_recasted || false,
        hasTipAllowance: user.tipAllowanceEnabled,
        ticketAwarded,
        ticketAwardedAt: ticketAwarded ? new Date() : undefined,
        updatedAt: new Date()
      },
      create: {
        raffleId: currentRaffle.id,
        userFid: fid,
        castHash: post_cast_hash,
        hasLiked: engagement_data?.has_liked || false,
        hasCommented: engagement_data?.has_commented || false,
        hasRecasted: engagement_data?.has_recasted || false,
        hasTipAllowance: user.tipAllowanceEnabled,
        ticketAwarded,
        ticketAwardedAt: ticketAwarded ? new Date() : undefined
      }
    });

    let userTicketsRecord = null;

    if (ticketAwarded) {
      // Update or create user tickets for this raffle
      userTicketsRecord = await prisma.userTickets.upsert({
        where: {
          raffleId_userFid: {
            raffleId: currentRaffle.id,
            userFid: fid
          }
        },
        update: {
          ticketsCount: { increment: 1 },
          lastLikeAt: new Date()
        },
        create: {
          raffleId: currentRaffle.id,
          userFid: fid,
          ticketsCount: 1,
          firstLikeAt: new Date(),
          lastLikeAt: new Date()
        }
      });

      // Update user lifetime tickets
      await prisma.user.update({
        where: { fid },
        data: {
          totalLifetimeTickets: { increment: 1 }
        }
      });

      // Update raffle totals if this is a new participant
      const isNewParticipant = userTicketsRecord.ticketsCount === 1;
      await prisma.raffle.update({
        where: { id: currentRaffle.id },
        data: {
          totalTickets: { increment: 1 },
          ...(isNewParticipant ? { totalParticipants: { increment: 1 } } : {})
        }
      });

      // Log the event
      await prisma.eventsLog.upsert({
        where: { userFid: fid },
        update: {
          eventType: 'LIKE',
          eventData: {
            raffleId: currentRaffle.id,
            castHash: post_cast_hash,
            ticketsEarned: 1
          },
          createdAt: new Date()
        },
        create: {
          userFid: fid,
          eventType: 'LIKE',
          eventData: {
            raffleId: currentRaffle.id,
            castHash: post_cast_hash,
            ticketsEarned: 1
          }
        }
      });
    }

    // Prepare response
    const response = {
      success: true,
      data: {
        ticketAwarded,
        requiredActions,
        userTickets: userTicketsRecord?.ticketsCount || 0,
        message: ticketAwarded 
          ? 'Congratulations! You earned 1 ticket!' 
          : `Please complete these actions: ${requiredActions.join(', ')}`,
        engagement: {
          hasLiked: engagement_data?.has_liked || false,
          hasCommented: engagement_data?.has_commented || false,
          hasRecasted: engagement_data?.has_recasted || false,
          hasTipAllowance: user.tipAllowanceEnabled
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing participation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}