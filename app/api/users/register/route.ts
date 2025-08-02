import { NextRequest, NextResponse } from 'next/server';
import { userRegistrationService } from '@/lib/services/user-registration';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, tokenId, commitmentScore, farcasterContext } = body;

    // Validate required fields
    if (!walletAddress || !tokenId) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'walletAddress and tokenId are required' 
        },
        { status: 400 }
      );
    }

    console.log('API: User registration request received:', {
      walletAddress,
      tokenId,
      hasFarcasterContext: !!farcasterContext
    });

    // Call registration service
    const user = await userRegistrationService.registerUserOnNFTAward({
      walletAddress,
      tokenId,
      commitmentScore,
      farcasterContext
    });

    // Return sanitized user data
    const responseData = {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        farcasterId: user.farcasterId,
        farcasterUsername: user.farcasterUsername,
        avatarUrl: user.avatarUrl,
        nftTokenId: user.nftTokenId,
        powerBadge: user.powerBadge,
        followerCount: user.followerCount,
        createdAt: user.createdAt
      }
    };

    console.log('API: User registration successful:', responseData.user.id);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('API: Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    const statusCode = errorMessage.includes('required') ? 400 : 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false 
      },
      { status: statusCode }
    );
  }
}

// Manual registration endpoint
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, farcasterId, farcasterUsername, tokenId } = body;

    // Validate at least one identifier
    if (!walletAddress && !farcasterId && !farcasterUsername) {
      return NextResponse.json(
        { 
          error: 'At least one identifier required',
          details: 'Provide walletAddress, farcasterId, or farcasterUsername' 
        },
        { status: 400 }
      );
    }

    console.log('API: Manual registration request:', {
      walletAddress,
      farcasterId,
      farcasterUsername,
      tokenId
    });

    // Call manual registration method
    const user = await userRegistrationService.registerUserManually({
      walletAddress,
      farcasterId,
      farcasterUsername,
      tokenId
    });

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        farcasterId: user.farcasterId,
        walletAddress: user.appWallet,
        avatarUrl: user.avatarUrl
      }
    });

  } catch (error) {
    console.error('API: Manual registration error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Manual registration failed',
        success: false 
      },
      { status: 500 }
    );
  }
}