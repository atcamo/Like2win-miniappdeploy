// DEPRECATED: This script was for the old Proof of Verano system
// Like2Win has replaced the bootcamp/NFT system with social engagement rewards
// This file is kept for legacy compatibility but should not be used

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * DEPRECATED: Legacy NFT validation script
 * Like2Win now uses social engagement instead of NFT certification
 */
export default async function validateNFTRegistration() {
  console.log('⚠️  DEPRECATED: This script is no longer used.');
  console.log('🎫 Like2Win now uses social engagement rewards instead of NFT certification.');
  console.log('📊 Check /miniapp for the new Like2Win system.');
  
  return { deprecated: true, message: 'Use Like2Win system instead' };
}

// DEPRECATED: Legacy sync function for old bootcamp system
export async function syncUserWithContract(walletAddress: string) {
  console.log('⚠️  DEPRECATED: syncUserWithContract is no longer used.');
  console.log('🎫 Like2Win now uses Farcaster engagement instead of wallet-based NFTs.');
  console.log('👤 Wallet:', walletAddress);
  
  // For backward compatibility, return a "not found" response
  return { 
    synced: false, 
    message: 'Like2Win has replaced the bootcamp system. Use /miniapp for social rewards.' 
  };
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  validateNFTRegistration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}