import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Like2Win Raffle Contract ABI (essential functions only)
export const LIKE2WIN_RAFFLE_ABI = [
  "function createRaffle(string memory _weekPeriod, uint256 _startDate, uint256 _endDate) external",
  "function addTickets(address _participant, uint256 _ticketCount, bytes calldata _signature) external",
  "function contributeToPool(uint256 _amount, string memory _source) external",
  "function executeRaffle(uint256 _raffleId) external",
  "function getRaffle(uint256 _raffleId) external view returns (tuple(uint256 id, string weekPeriod, uint256 startDate, uint256 endDate, uint256 totalPool, uint256 totalTickets, uint256 totalParticipants, bool isActive, bool isCompleted, uint256 randomSeed, address firstPlace, address secondPlace, address thirdPlace, uint256 firstPrize, uint256 secondPrize, uint256 thirdPrize))",
  "function getParticipant(uint256 _raffleId, address _participant) external view returns (tuple(uint256 ticketCount, bool hasParticipated, uint256 firstTicketNumber, uint256 lastTicketNumber))",
  "function currentRaffleId() external view returns (uint256)",
  "event RaffleCreated(uint256 indexed raffleId, string weekPeriod, uint256 startDate, uint256 endDate)",
  "event TicketsAdded(uint256 indexed raffleId, address indexed participant, uint256 ticketCount)",
  "event RaffleCompleted(uint256 indexed raffleId, address firstPlace, address secondPlace, address thirdPlace, uint256 firstPrize, uint256 secondPrize, uint256 thirdPrize)"
] as const;

// $DEGEN Token ABI
export const DEGEN_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
] as const;

// Contract addresses
export const CONTRACT_ADDRESSES = {
  LIKE2WIN_RAFFLE: process.env.NEXT_PUBLIC_LIKE2WIN_CONTRACT_ADDRESS || "",
  DEGEN_TOKEN: "0x4ed4E862860beD51a9570b96d89aF5E1B0Eff945" // $DEGEN on Base
} as const;

// Viem public client for Base network
export const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

export interface RaffleData {
  id: bigint;
  weekPeriod: string;
  startDate: bigint;
  endDate: bigint;
  totalPool: bigint;
  totalTickets: bigint;
  totalParticipants: bigint;
  isActive: boolean;
  isCompleted: boolean;
  randomSeed: bigint;
  firstPlace: string;
  secondPlace: string;
  thirdPlace: string;
  firstPrize: bigint;
  secondPrize: bigint;
  thirdPrize: bigint;
}

export interface ParticipantData {
  ticketCount: bigint;
  hasParticipated: boolean;
  firstTicketNumber: bigint;
  lastTicketNumber: bigint;
}

/**
 * Get current raffle data from the smart contract
 */
export async function getCurrentRaffle(): Promise<RaffleData | null> {
  if (!CONTRACT_ADDRESSES.LIKE2WIN_RAFFLE) {
    console.warn('Like2Win contract address not set');
    return null;
  }

  try {
    const currentRaffleId = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.LIKE2WIN_RAFFLE as `0x${string}`,
      abi: LIKE2WIN_RAFFLE_ABI,
      functionName: 'currentRaffleId',
    });

    if (currentRaffleId === BigInt(0)) {
      return null;
    }

    const raffleData = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.LIKE2WIN_RAFFLE as `0x${string}`,
      abi: LIKE2WIN_RAFFLE_ABI,
      functionName: 'getRaffle',
      args: [currentRaffleId],
    });

    return raffleData as RaffleData;
  } catch (error) {
    console.error('Error fetching raffle data:', error);
    return null;
  }
}

/**
 * Get participant data for a specific raffle and address
 */
export async function getParticipantData(raffleId: bigint, address: string): Promise<ParticipantData | null> {
  if (!CONTRACT_ADDRESSES.LIKE2WIN_RAFFLE) {
    console.warn('Like2Win contract address not set');
    return null;
  }

  try {
    const participantData = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.LIKE2WIN_RAFFLE as `0x${string}`,
      abi: LIKE2WIN_RAFFLE_ABI,
      functionName: 'getParticipant',
      args: [raffleId, address as `0x${string}`],
    });

    return participantData as ParticipantData;
  } catch (error) {
    console.error('Error fetching participant data:', error);
    return null;
  }
}

/**
 * Get user's $DEGEN balance
 */
export async function getDegenBalance(address: string): Promise<bigint> {
  try {
    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.DEGEN_TOKEN as `0x${string}`,
      abi: DEGEN_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });

    return balance as bigint;
  } catch (error) {
    console.error('Error fetching DEGEN balance:', error);
    return BigInt(0);
  }
}

/**
 * Format DEGEN amount from wei to readable format
 */
export function formatDegen(amount: bigint): string {
  return ethers.utils.formatUnits(amount.toString(), 18);
}

/**
 * Parse DEGEN amount from readable format to wei
 */
export function parseDegen(amount: string): bigint {
  return BigInt(ethers.utils.parseUnits(amount, 18).toString());
}

/**
 * Generate signature for ticket allocation (server-side only)
 */
export async function generateTicketSignature(
  raffleId: bigint,
  participant: string,
  ticketCount: bigint,
  privateKey: string
): Promise<string> {
  const messageHash = ethers.utils.solidityKeccak256(
    ['uint256', 'address', 'uint256'],
    [raffleId.toString(), participant, ticketCount.toString()]
  );
  
  const wallet = new ethers.Wallet(privateKey);
  return await wallet.signMessage(ethers.utils.arrayify(messageHash));
}