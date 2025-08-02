import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    
    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier is required' },
        { status: 400 }
      );
    }

    console.log('API: Profile request for identifier:', identifier);

    let user = null;

    // Try different lookup methods based on identifier format
    if (identifier.startsWith('0x')) {
      // Ethereum wallet address
      user = await userService.findByAppWallet(identifier.toLowerCase());
    } else if (/^\d+$/.test(identifier)) {
      // Numeric - likely a Farcaster ID
      user = await userService.findByFarcasterId(identifier);
    } else {
      // Try username lookups
      user = await userService.findByUsername(identifier) ||
             await userService.findByFarcasterUsername(identifier);
    }

    if (!user) {
      console.log('API: User not found for identifier:', identifier);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('API: User found:', user.id);

    // Return public profile data
    const publicProfile = {
      id: user.id,
      username: user.username || user.farcasterUsername,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      website: user.website,
      
      // Farcaster data
      farcasterId: user.farcasterId,
      farcasterUsername: user.farcasterUsername,
      farcasterVerified: user.farcasterVerified,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      powerBadge: user.powerBadge,
      
      // Like2Win specific data
      fid: user.fid?.toString(),
      pfpUrl: user.pfpUrl,
      tipAllowanceEnabled: user.tipAllowanceEnabled,
      isFollowingLike2Win: user.isFollowingLike2Win,
      totalLifetimeTickets: user.totalLifetimeTickets,
      totalWinnings: user.totalWinnings?.toString(),
      
      // Legacy data (kept for migration purposes)
      completionDate: user.completionDate,
      commitmentScore: user.commitmentScore,
      nftTokenId: user.nftTokenId,
      
      // Timestamps
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json(publicProfile);

  } catch (error) {
    console.error('API: Profile fetch error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Update user profile (protected - would need auth in production)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const body = await req.json();

    // In production, verify the user has permission to update this profile
    // For now, we'll allow updates for demonstration

    let user = null;

    // Find user by identifier
    if (identifier.startsWith('0x')) {
      user = await userService.findByAppWallet(identifier.toLowerCase());
    } else if (/^\d+$/.test(identifier)) {
      user = await userService.findByFarcasterId(identifier);
    } else {
      user = await userService.findByUsername(identifier) ||
             await userService.findByFarcasterUsername(identifier);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update only allowed fields
    const allowedFields = [
      'displayName',
      'bio',
      'website',
      'email'
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    console.log('API: Updating user profile:', user.id, updateData);

    const updatedUser = await userService.updateUser(user.id, updateData);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        website: updatedUser.website
      }
    });

  } catch (error) {
    console.error('API: Profile update error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}