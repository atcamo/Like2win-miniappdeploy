import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getCurrentRaffle, getParticipantData, CONTRACT_ADDRESSES, LIKE2WIN_RAFFLE_ABI } from '@/lib/blockchain/contract';

/**
 * GET /api/blockchain/raffle
 * Returns current raffle data from smart contract
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    const raffleData = await getCurrentRaffle();
    
    if (!raffleData) {
      return NextResponse.json({ 
        success: false, 
        message: 'No active raffle found' 
      }, { status: 404 });
    }

    let participantData = null;
    if (address && ethers.utils.isAddress(address)) {
      participantData = await getParticipantData(raffleData.id, address);
    }

    return NextResponse.json({
      success: true,
      data: {
        raffle: {
          id: raffleData.id.toString(),
          weekPeriod: raffleData.weekPeriod,
          startDate: new Date(Number(raffleData.startDate) * 1000).toISOString(),
          endDate: new Date(Number(raffleData.endDate) * 1000).toISOString(),
          totalPool: ethers.utils.formatUnits(raffleData.totalPool, 18),
          totalTickets: raffleData.totalTickets.toString(),
          totalParticipants: raffleData.totalParticipants.toString(),
          isActive: raffleData.isActive,
          isCompleted: raffleData.isCompleted,
          winners: raffleData.isCompleted ? {
            firstPlace: raffleData.firstPlace,
            secondPlace: raffleData.secondPlace,
            thirdPlace: raffleData.thirdPlace,
            firstPrize: ethers.utils.formatUnits(raffleData.firstPrize, 18),
            secondPrize: ethers.utils.formatUnits(raffleData.secondPrize, 18),
            thirdPrize: ethers.utils.formatUnits(raffleData.thirdPrize, 18),
          } : null
        },
        participant: participantData ? {
          ticketCount: participantData.ticketCount.toString(),
          hasParticipated: participantData.hasParticipated,
          ticketRange: participantData.hasParticipated ? {
            from: participantData.firstTicketNumber.toString(),
            to: participantData.lastTicketNumber.toString()
          } : null
        } : null
      }
    });

  } catch (error) {
    console.error('Error fetching blockchain raffle data:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch raffle data' 
    }, { status: 500 });
  }
}

/**
 * POST /api/blockchain/raffle/create
 * Creates a new raffle on the smart contract (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { weekPeriod, startDate, endDate } = await request.json();
    
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

    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL || "https://mainnet.base.org");
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    
    // Initialize contract
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.LIKE2WIN_RAFFLE,
      LIKE2WIN_RAFFLE_ABI,
      wallet
    );

    // Convert dates to timestamps
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    // Create raffle transaction
    const tx = await contract.createRaffle(weekPeriod, startTimestamp, endTimestamp);
    const receipt = await tx.wait();

    // Extract raffle ID from events
    const raffleCreatedEvent = receipt.events?.find((e: any) => e.event === 'RaffleCreated');
    const raffleId = raffleCreatedEvent?.args?.raffleId?.toString();

    return NextResponse.json({
      success: true,
      data: {
        transactionHash: receipt.transactionHash,
        raffleId,
        blockNumber: receipt.blockNumber
      }
    });

  } catch (error) {
    console.error('Error creating blockchain raffle:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create raffle on blockchain',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}