# Like2Win Smart Contract

## Overview

The Like2Win Raffle Smart Contract manages bi-weekly $DEGEN raffles on Base network with transparent, verifiable random number generation and automated prize distribution.

## Features

- **Transparent Raffles**: All raffle data stored on-chain
- **Weighted Ticket System**: More engagement = more tickets = higher win chances  
- **Automated Prize Distribution**: Smart contract distributes 50/30/20% prizes
- **Verifiable Randomness**: Uses blockhash + timestamp for random number generation
- **Signature Verification**: Only validated engagement can earn tickets
- **Emergency Controls**: Admin functions for edge cases

## Contract Architecture

### Core Functions

- `createRaffle()`: Creates new bi-weekly raffle
- `addTickets()`: Adds tickets for users (signature-verified)
- `contributeToPool()`: Allows community $DEGEN contributions
- `executeRaffle()`: Draws winners and distributes prizes

### Prize Structure

- **1st Place**: 50% of total pool
- **2nd Place**: 30% of total pool  
- **3rd Place**: 20% of total pool

## Deployment

### Prerequisites

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
```

### Required Environment Variables

```bash
# Blockchain
PRIVATE_KEY=your_deployment_private_key
BASESCAN_API_KEY=your_basescan_api_key
BASE_RPC_URL=https://mainnet.base.org
ADMIN_PRIVATE_KEY=your_admin_private_key

# Contract
NEXT_PUBLIC_LIKE2WIN_CONTRACT_ADDRESS=deployed_contract_address
```

### Deploy to Base

```bash
# Compile contract
bun run contract:compile

# Deploy to Base mainnet
bun run contract:deploy

# Deploy to Base testnet (Sepolia)
bun run contract:deploy:testnet
```

## Integration

### Frontend Integration

```typescript
import { getCurrentRaffle, getParticipantData } from '@/lib/blockchain/contract';

// Get current raffle data
const raffle = await getCurrentRaffle();

// Get user's tickets for raffle
const participant = await getParticipantData(raffle.id, userAddress);
```

### API Integration

```bash
# Get current raffle
GET /api/blockchain/raffle

# Get raffle + user data  
GET /api/blockchain/raffle?address=0x...

# Add tickets (admin only)
POST /api/blockchain/tickets
{
  "fid": "123456",
  "ticketCount": 5,
  "raffleId": "1"
}
```

## Security Features

### Signature Verification
- Only admin-signed tickets can be added
- Prevents unauthorized ticket manipulation
- Links off-chain engagement to on-chain tickets

### Randomness
- Uses blockhash + timestamp + difficulty
- Generated at execution time (not predictable)
- Additional entropy from total tickets

### Access Control
- Owner-only functions for raffle management
- ReentrancyGuard for safe token transfers
- Emergency withdrawal capabilities

## Hackathon Demo

This smart contract demonstrates:

1. **Real Blockchain Usage**: Actual $DEGEN token integration on Base
2. **Transparent Operations**: All raffle data verifiable on Basescan
3. **Community Economics**: Automated prize distribution creates real value
4. **Social Integration**: Bridges Web2 social (Farcaster) with Web3 rewards
5. **Production Ready**: Full error handling, events, and security measures

## Contract Address

**Base Mainnet**: `[Deploy and add address here]`
**Base Testnet**: `[Deploy and add address here]`

## Verification

After deployment, verify the contract:

```bash
npx hardhat verify --network base [CONTRACT_ADDRESS] [DEGEN_TOKEN_ADDRESS]
```

## Gas Optimization

- Uses `uint256` for efficiency
- Batches operations where possible
- Optimized loops and storage patterns
- ~200,000 gas for raffle execution

## Future Enhancements

- Multi-token support (beyond $DEGEN)
- Dutch auction style prize pools
- NFT rewards for winners
- Cross-chain raffle mechanics