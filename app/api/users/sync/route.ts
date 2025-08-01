import { NextRequest, NextResponse } from 'next/server';

// API endpoint to sync a specific user with the contract
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    console.log('API: Syncing user with contract:', walletAddress);

    // Dynamic import to avoid build-time issues
    const { syncUserWithContract } = await import('@/scripts/validate-nft-registration');
    const result = await syncUserWithContract(walletAddress);

    return NextResponse.json({
      success: true,
      synced: result.synced,
      message: result.message
    });

  } catch (error) {
    console.error('API: Sync error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Sync failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

// API endpoint to validate all users (admin only)
export async function GET() {
  try {
    // In production, add admin authentication here
    console.log('API: Running full NFT registration validation');

    // Conditionally import to avoid build-time issues
    if (process.env.NODE_ENV === 'development') {
      const { default: validateNFTRegistration } = await import('@/scripts/validate-nft-registration');
      await validateNFTRegistration();
    }

    return NextResponse.json({
      success: true,
      message: 'Validation completed. Check server logs for details.'
    });

  } catch (error) {
    console.error('API: Validation error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Validation failed',
        success: false 
      },
      { status: 500 }
    );
  }
}