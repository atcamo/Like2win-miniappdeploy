import { NextRequest, NextResponse } from 'next/server';

// Mock participation endpoint to avoid Prisma conflicts
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

    // Mock logic for awarding tickets
    const hasLiked = engagement_data?.has_liked || false;
    const hasCommented = engagement_data?.has_commented || false;
    const hasRecasted = engagement_data?.has_recasted || false;
    const hasTipAllowance = engagement_data?.tip_allowance || false;

    let ticketAwarded = false;
    const requiredActions: string[] = [];

    if (hasTipAllowance) {
      // Users with tip allowance only need to like
      if (hasLiked) {
        ticketAwarded = true;
      } else {
        requiredActions.push('like');
      }
    } else {
      // Users without tip allowance need like + comment + recast
      if (hasLiked && hasCommented && hasRecasted) {
        ticketAwarded = true;
      } else {
        if (!hasLiked) requiredActions.push('like');
        if (!hasCommented) requiredActions.push('comment');
        if (!hasRecasted) requiredActions.push('recast');
      }
    }

    // Mock response - simulate awarding a ticket
    const currentTickets = ticketAwarded ? 1 : 0;

    const response = {
      success: true,
      data: {
        ticketAwarded,
        requiredActions,
        userTickets: currentTickets,
        message: ticketAwarded 
          ? 'Congratulations! You earned 1 ticket!' 
          : `Please complete these actions: ${requiredActions.join(', ')}`,
        engagement: {
          hasLiked,
          hasCommented,
          hasRecasted,
          hasTipAllowance
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in participation mock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}