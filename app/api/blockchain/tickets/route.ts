import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, LIKE2WIN_RAFFLE_ABI, generateTicketSignature } from '@/lib/blockchain/contract';
import { getUserByFid } from '@/lib/user-service';

/**
 * POST /api/blockchain/tickets
 * Adds tickets for a user on the smart contract (with signature verification)
 */
export async function POST(request: NextRequest) {
  try {
    const { fid, ticketCount, raffleId } = await request.json();
    
    if (!fid || !ticketCount || !raffleId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required parameters' 
      }, { status: 400 });
    }

    if (!process.env.ADMIN_PRIVATE_KEY) {
      return NextResponse.json({ 
        success: false, 
        message: 'Admin private key not configured' 
      }, { status: 500 });
    }

    if (!CONTRACT_ADDRESSES.LIKE2WIN_RAFFLE) {
      return NextResponse.json({ 
        success: false, 
        message: 'Contract address not configured' 
      }, { status: 500 });
    }

    // Get user data from database
    const user = await getUserByFid(BigInt(fid));
    if (!user || !user.appWallet) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found or no wallet address' 
      }, { status: 404 });
    }

    // Generate signature for ticket allocation
    const signature = generateTicketSignature(
      BigInt(raffleId),
      user.appWallet,
      BigInt(ticketCount),
      process.env.ADMIN_PRIVATE_KEY
    );

    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL || "https://mainnet.base.org");
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    
    // Initialize contract
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.LIKE2WIN_RAFFLE,
      LIKE2WIN_RAFFLE_ABI,
      wallet
    );

    // Add tickets transaction
    const tx = await contract.addTickets(user.appWallet, ticketCount, signature);
    const receipt = await tx.wait();

    // Extract ticket data from events
    const ticketsAddedEvent = receipt.events?.find((e: any) => e.event === 'TicketsAdded');
    const addedTickets = ticketsAddedEvent?.args?.ticketCount?.toString();

    return NextResponse.json({
      success: true,
      data: {
        transactionHash: receipt.transactionHash,
        userAddress: user.appWallet,
        ticketsAdded: addedTickets,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    });

  } catch (error) {
    console.error('Error adding tickets to blockchain:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to add tickets on blockchain',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}