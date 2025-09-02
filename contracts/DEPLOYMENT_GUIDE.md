# Like2Win Daily Raffle Smart Contract Deployment Guide

## Contract Overview

The `Like2WinDailyRaffle.sol` contract implements:
- **Daily raffles**: 24-hour windows (7 consecutive days)
- **Prize**: 500 DEGEN per day (3,500 DEGEN total per week)
- **Automatic execution**: At 23:59 UTC with next raffle starting at 00:01 UTC
- **Weighted selection**: More tickets = higher chances (but everyone has a chance)

## Pre-deployment Checklist

### 1. DEGEN Token Address (Base Mainnet)
```
0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed
```

### 2. Required Environment Variables
```bash
PRIVATE_KEY=your_wallet_private_key
BASESCAN_API_KEY=your_basescan_api_key
```

### 3. Base Network Configuration
- **Chain ID**: 8453 (Base Mainnet)
- **RPC URL**: https://mainnet.base.org
- **Currency**: ETH
- **Explorer**: https://basescan.org

## Deployment Options

### Option 1: Remix IDE (Recommended for quick deployment)

1. **Open Remix IDE**: https://remix.ethereum.org
2. **Create new file**: `Like2WinDailyRaffle.sol`
3. **Copy contract code** from `contracts/Like2WinDailyRaffle.sol`
4. **Connect wallet** to Base network
5. **Compile contract** (Solidity 0.8.20)
6. **Deploy with parameters**:
   - `_degenToken`: `0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed`
7. **Verify on BaseScan** (optional but recommended)

### Option 2: Hardhat (When build issues are resolved)

```bash
# Compile contracts
npx hardhat compile

# Deploy to Base testnet first
npx hardhat run scripts/deploy-daily-raffle-testnet.js --network base-sepolia

# Deploy to Base mainnet
npx hardhat run scripts/deploy-daily-raffle.js --network base

# Verify contract
npx hardhat verify --network base <CONTRACT_ADDRESS> 0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed
```

### Option 3: Foundry (Alternative)

```bash
# Install Foundry if not installed
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Deploy to Base
forge create --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  --etherscan-api-key $BASESCAN_API_KEY \
  --verify \
  contracts/Like2WinDailyRaffle.sol:Like2WinDailyRaffle \
  --constructor-args 0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed
```

## Post-deployment Steps

### 1. Fund the Contract
Transfer 3,500 DEGEN tokens to the contract address:
```
Weekly fund = 500 DEGEN × 7 days = 3,500 DEGEN
```

### 2. Start Weekly Raffle Series
Call the `startWeeklyRaffleSeries()` function:
- This creates the first daily raffle
- Ensures contract has sufficient DEGEN balance
- Emits `WeeklySeriesStarted` event

### 3. Verify Contract Functions
Test the following functions:
- `getCurrentDailyRaffle()` - Should return active raffle info
- `getTimeUntilRaffleEnd()` - Should show time remaining
- `fundContract(amount)` - For adding more DEGEN

### 4. Set Up Automation
Configure the automation system to call:
- `executeDailyRaffle()` at 23:59 UTC daily
- This will automatically create the next day's raffle

## Integration with Backend

Update the following files with the deployed contract address:

### Environment Variables (.env)
```bash
DAILY_RAFFLE_CONTRACT_ADDRESS=0x...
DEGEN_TOKEN_ADDRESS=0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed
BASE_RPC_URL=https://mainnet.base.org
```

### Contract ABI
Copy the ABI from `artifacts/contracts/Like2WinDailyRaffle.sol/Like2WinDailyRaffle.json` after compilation.

### Backend API Updates
Update these endpoints to interact with the daily raffle contract:
- `/api/raffle/status` - Read current daily raffle status
- `/api/raffle/participate` - Add tickets to daily raffle  
- `/api/automation/daily-raffle` - Execute daily raffle
- `/api/admin/close-raffle` - Manual raffle execution

## Security Considerations

### Access Control
- **Owner**: Only owner can add tickets and execute raffles
- **Signatures**: All ticket additions require valid signatures
- **Reentrancy**: Protected by ReentrancyGuard
- **Emergency**: Emergency withdraw function for owner

### Randomness
- Uses blockhash, timestamp, and difficulty for randomness
- Not suitable for high-value raffles (consider Chainlink VRF for production)
- Sufficient for community engagement raffles

### Token Safety
- Uses OpenZeppelin SafeERC20 for secure token transfers
- Checks balance before starting weekly series
- Emergency withdraw available to owner

## Monitoring and Maintenance

### Events to Monitor
- `DailyRaffleCreated` - New daily raffle started
- `TicketsAdded` - User participated in raffle
- `DailyRaffleCompleted` - Daily winner selected
- `WeeklySeriesStarted` - New 7-day cycle began

### Regular Tasks
- Monitor DEGEN balance in contract
- Verify daily raffle execution at 23:59 UTC
- Check automation system health
- Refund contract weekly with 3,500 DEGEN

### Troubleshooting
- If automation fails, use manual execution scripts
- Emergency pause available via `pauseCurrentRaffle()`
- Contract upgrade would require new deployment

## Cost Estimates (Base Network)

- **Deployment**: ~$2-5 USD in ETH
- **Start weekly series**: ~$0.50 USD
- **Daily execution**: ~$0.50 USD per day
- **Add tickets**: ~$0.10 USD per transaction
- **Total weekly cost**: ~$5-10 USD in gas fees

## Example Deployment Flow

```bash
# 1. Set environment variables
export PRIVATE_KEY="0x..."
export BASESCAN_API_KEY="..."

# 2. Deploy via Remix or command line
# Contract address: 0x...

# 3. Fund contract
# Transfer 3,500 DEGEN to contract

# 4. Start first weekly series
# Call startWeeklyRaffleSeries()

# 5. Update backend configuration
# Set DAILY_RAFFLE_CONTRACT_ADDRESS

# 6. Test automation
# Run manual-daily-execution.js

# 7. Deploy to production
# Update GitHub secrets and deploy
```

Ready for deployment! 🚀