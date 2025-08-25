import { NextRequest, NextResponse } from 'next/server';
import { createDegenDistributor } from '@/lib/services/degenDistribution';

/**
 * Check wallet configuration and DEGEN balance
 */
export async function GET(request: NextRequest) {
  try {
    console.log('💳 Checking wallet configuration...');

    // Check environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const neynarApiKey = process.env.NEYNAR_API_KEY;

    const config = {
      hasPrivateKey: !!privateKey,
      hasNeynarApiKey: !!neynarApiKey,
      privateKeyFormat: privateKey ? 
        (privateKey.startsWith('0x') ? 'Correct format' : 'Missing 0x prefix') : 
        'Not configured'
    };

    if (!privateKey) {
      return NextResponse.json({
        success: false,
        message: 'Wallet not configured',
        config,
        instructions: [
          '1. Add PRIVATE_KEY to your environment variables',
          '2. Make sure it starts with 0x',
          '3. Fund the wallet with DEGEN tokens on Base network',
          '4. Test the connection'
        ]
      });
    }

    // Try to create distributor
    const distributor = createDegenDistributor();
    
    if (!distributor) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create distributor',
        config,
        error: 'Could not initialize wallet client'
      });
    }

    // Get wallet info
    const walletAddress = distributor.getWalletAddress();
    console.log(`📍 Wallet address: ${walletAddress}`);

    // Get balance
    let balance = null;
    let balanceError = null;
    
    try {
      balance = await distributor.getBalance();
      console.log(`💰 DEGEN balance: ${balance.formattedBalance}`);
    } catch (error) {
      balanceError = error instanceof Error ? error.message : String(error);
      console.error('❌ Balance check failed:', balanceError);
    }

    // Test address resolution (use a known FID)
    let addressResolutionTest = null;
    try {
      const testAddress = await distributor.getAddressFromFid('432789'); // atcamo
      addressResolutionTest = {
        success: !!testAddress,
        address: testAddress,
        message: testAddress ? 'Address resolution working' : 'Failed to resolve address'
      };
    } catch (error) {
      addressResolutionTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    const readyForDistribution = !!(
      config.hasPrivateKey && 
      config.hasNeynarApiKey && 
      balance && 
      parseFloat(balance.formattedBalance) >= 1000 &&
      addressResolutionTest?.success
    );

    return NextResponse.json({
      success: true,
      message: 'Wallet check completed',
      config,
      wallet: {
        address: walletAddress,
        balance: balance ? {
          raw: balance.balance,
          formatted: balance.formattedBalance + ' DEGEN',
          sufficient: balance ? parseFloat(balance.formattedBalance) >= 1000 : false
        } : null,
        balanceError
      },
      addressResolution: addressResolutionTest,
      readyForDistribution,
      recommendations: readyForDistribution ? 
        ['✅ Wallet is ready for automatic distribution!'] : 
        [
          !config.hasPrivateKey ? '❌ Configure PRIVATE_KEY' : '✅ Private key configured',
          !config.hasNeynarApiKey ? '❌ Configure NEYNAR_API_KEY' : '✅ Neynar API key configured',
          !balance ? '❌ Check network connection' : 
            parseFloat(balance.formattedBalance) < 1000 ? '❌ Fund wallet with at least 1000 DEGEN' : '✅ Sufficient DEGEN balance',
          !addressResolutionTest?.success ? '❌ Fix address resolution' : '✅ Address resolution working'
        ]
    });

  } catch (error) {
    console.error('❌ Wallet check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Wallet check failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}