const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDailyRaffles() {
  console.log('🎯 Setting up Like2Win Daily Raffle System...');

  try {
    // Close any existing active raffles
    const activeRaffles = await prisma.raffle.updateMany({
      where: {
        status: 'ACTIVE'
      },
      data: {
        status: 'CANCELLED',
        executedAt: new Date()
      }
    });

    if (activeRaffles.count > 0) {
      console.log(`📋 Cancelled ${activeRaffles.count} existing active raffles`);
    }

    // Create the first daily raffle
    const now = new Date();
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const dayOfWeek = now.getDay() || 7; // Sunday = 7, Monday = 1, etc.

    const firstDailyRaffle = await prisma.raffle.create({
      data: {
        weekPeriod: `Daily ${now.toISOString().split('T')[0]}`, // \"Daily 2025-08-30\"
        startDate: now,
        endDate: endDate,
        status: 'ACTIVE',
        raffleType: 'DAILY',
        dayNumber: dayOfWeek,
        prizeAmount: 500, // 500 DEGEN
        totalPool: 500
      }
    });

    console.log('✅ Created first daily raffle:', {
      id: firstDailyRaffle.id,
      weekPeriod: firstDailyRaffle.weekPeriod,
      dayNumber: dayOfWeek,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      prizeAmount: 500
    });

    // Show configuration summary
    console.log('\\n📊 Daily Raffle System Configuration:');
    console.log('• Prize per day: 500 DEGEN');
    console.log('• Duration: 24 hours per raffle');
    console.log('• Execution: 23:59 UTC daily');
    console.log('• Next raffle start: 00:01 UTC daily');
    console.log('• Total weekly fund needed: 3,500 DEGEN (500 × 7 days)');
    console.log('• Automation: GitHub Actions cron jobs');

    console.log('\\n🚀 Next Steps:');
    console.log('1. Set AUTOMATION_SECRET in GitHub repository secrets');
    console.log('2. Set PRODUCTION_URL in GitHub repository secrets');
    console.log('3. Deploy to production (Vercel)');
    console.log('4. Test automation with manual workflow trigger');
    console.log('5. Fund DEGEN wallet for prize distribution');

    return firstDailyRaffle;

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Test the automation API endpoint
async function testAutomationEndpoint() {
  console.log('\\n🧪 Testing automation endpoint...');
  
  try {
    const testSecret = 'test-secret-123';
    
    // Test GET endpoint
    const response = await fetch('http://localhost:3000/api/automation/daily-raffle');
    const data = await response.json();
    
    console.log('📊 API Info:', data);
    
    console.log('\\n✅ Automation endpoint is accessible');
    console.log('⚠️  Remember to set real AUTOMATION_SECRET in production');
    
  } catch (error) {
    console.log('⚠️  Could not test endpoint (server may not be running):', error.message);
  }
}

// Run the setup
if (require.main === module) {
  setupDailyRaffles()
    .then(async (raffle) => {
      console.log('\\n🎉 Daily raffle system setup completed!');
      await testAutomationEndpoint();
    })
    .catch(console.error);
}

module.exports = { setupDailyRaffles };