/**
 * Like2Win $DEGEN Token Distribution Service
 * Handles automatic distribution of DEGEN tokens to raffle winners
 */

import { createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// DEGEN token contract on Base
const DEGEN_TOKEN_ADDRESS = '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed' as const;

// ERC20 ABI for DEGEN token
const DEGEN_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

interface DistributionResult {
  success: boolean;
  message: string;
  transactionHash?: string;
  amount?: string;
  recipientFid?: string;
  error?: string;
}

export class DegenDistributionService {
  private walletClient: any;
  private account: any;

  constructor() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }

    this.account = privateKeyToAccount(privateKey as `0x${string}`);
    this.walletClient = createWalletClient({
      account: this.account,
      chain: base,
      transport: http()
    });
  }

  /**
   * Get the wallet balance of DEGEN tokens
   */
  async getBalance(): Promise<{ balance: string; formattedBalance: string }> {
    try {
      const balance = await this.walletClient.readContract({
        address: DEGEN_TOKEN_ADDRESS,
        abi: DEGEN_ABI,
        functionName: 'balanceOf',
        args: [this.account.address]
      });

      const formattedBalance = formatUnits(balance, 18); // DEGEN has 18 decimals
      
      return {
        balance: balance.toString(),
        formattedBalance
      };
    } catch (error) {
      console.error('❌ Error getting DEGEN balance:', error);
      throw error;
    }
  }

  /**
   * Get recipient address from FID using Neynar
   */
  async getAddressFromFid(fid: string): Promise<string | null> {
    try {
      const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
      if (!NEYNAR_API_KEY) {
        throw new Error('NEYNAR_API_KEY not configured');
      }

      const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user data: ${response.status}`);
      }

      const userData = await response.json();
      const user = userData.users?.[0];
      
      if (!user) {
        throw new Error(`User with FID ${fid} not found`);
      }

      // Get verified address or custody address
      const verifiedAddress = user.verified_addresses?.eth_addresses?.[0];
      const custodyAddress = user.custody_address;
      
      const recipientAddress = verifiedAddress || custodyAddress;
      
      if (!recipientAddress) {
        throw new Error(`No address found for FID ${fid}`);
      }

      return recipientAddress;
    } catch (error) {
      console.error(`❌ Error getting address for FID ${fid}:`, error);
      return null;
    }
  }

  /**
   * Distribute DEGEN tokens to winner
   */
  async distributeToWinner(
    recipientFid: string, 
    amount: number
  ): Promise<DistributionResult> {
    try {
      console.log(`🎯 Starting DEGEN distribution to FID ${recipientFid}...`);
      console.log(`💰 Amount: ${amount} DEGEN`);

      // 1. Get recipient address
      const recipientAddress = await this.getAddressFromFid(recipientFid);
      if (!recipientAddress) {
        return {
          success: false,
          message: `Failed to get address for FID ${recipientFid}`,
          error: 'Address not found'
        };
      }

      console.log(`📍 Recipient address: ${recipientAddress}`);

      // 2. Check our balance
      const { formattedBalance } = await this.getBalance();
      const currentBalance = parseFloat(formattedBalance);
      
      console.log(`💳 Current wallet balance: ${formattedBalance} DEGEN`);

      if (currentBalance < amount) {
        return {
          success: false,
          message: `Insufficient balance. Need ${amount} DEGEN, have ${formattedBalance} DEGEN`,
          error: 'Insufficient balance'
        };
      }

      // 3. Convert amount to wei (18 decimals for DEGEN)
      const amountInWei = parseUnits(amount.toString(), 18);
      console.log(`🔢 Amount in wei: ${amountInWei}`);

      // 4. Execute transfer
      console.log('📤 Executing DEGEN transfer...');
      const hash = await this.walletClient.writeContract({
        address: DEGEN_TOKEN_ADDRESS,
        abi: DEGEN_ABI,
        functionName: 'transfer',
        args: [recipientAddress as `0x${string}`, amountInWei]
      });

      console.log(`✅ Transaction submitted: ${hash}`);

      // 5. Wait for transaction confirmation (optional)
      // You could add transaction receipt waiting here if needed

      return {
        success: true,
        message: `Successfully sent ${amount} DEGEN to FID ${recipientFid}`,
        transactionHash: hash,
        amount: amount.toString(),
        recipientFid
      };

    } catch (error) {
      console.error('❌ Error distributing DEGEN:', error);
      return {
        success: false,
        message: 'Failed to distribute DEGEN',
        error: error instanceof Error ? error.message : String(error),
        recipientFid
      };
    }
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.account.address;
  }
}

/**
 * Utility function to create distribution service
 */
export const createDegenDistributor = () => {
  try {
    return new DegenDistributionService();
  } catch (error) {
    console.error('❌ Failed to create DEGEN distributor:', error);
    return null;
  }
};