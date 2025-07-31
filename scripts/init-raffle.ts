import { raffleService } from '@/lib/services/raffle-service';

async function initializeFirstRaffle() {
  try {
    console.log('🎲 Initializing Like2Win raffle system...');
    
    // Ensure there's an active raffle
    const raffleId = await raffleService.ensureActiveRaffle();
    
    console.log(`✅ Active raffle ready: ${raffleId}`);
    console.log('\n🎫 Like2Win is ready to go!');
    console.log('Users can now:');
    console.log('- Follow @Like2Win');
    console.log('- Like official posts to earn tickets');
    console.log('- Participate in bi-weekly raffles');
    
  } catch (error) {
    console.error('❌ Error initializing raffle:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeFirstRaffle().then(() => process.exit(0));
}

export { initializeFirstRaffle };