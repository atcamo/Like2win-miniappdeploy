/**
 * Manual Daily Raffle Execution Script
 * 
 * Use this script to manually trigger daily raffle operations:
 * - Execute current daily raffle
 * - Start next daily raffle
 * - Full daily cycle (execute + start)
 * 
 * Usage:
 * node scripts/manual-daily-execution.js execute_daily_raffle
 * node scripts/manual-daily-execution.js start_next_raffle  
 * node scripts/manual-daily-execution.js full_daily_cycle
 */

const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
const automationSecret = process.env.AUTOMATION_SECRET || 'test-secret-123';

async function executeDailyRaffleAction(action) {
  console.log(`🤖 Manual Daily Raffle Execution: ${action}`);
  console.log(`🌐 Target URL: ${baseUrl}`);
  
  try {
    const response = await fetch(`${baseUrl}/api/automation/daily-raffle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        authorization: automationSecret
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Action completed successfully!');
      console.log('📊 Result:', JSON.stringify(result, null, 2));
      
      // Show specific results based on action
      if (action === 'execute_daily_raffle' && result.winner) {
        console.log(`\\n🏆 Winner Details:`);
        console.log(`   FID: ${result.winner.fid}`);
        console.log(`   Tickets: ${result.winner.tickets}`);
        console.log(`   Prize: ${result.winner.prize} DEGEN`);
        console.log(`   Total Participants: ${result.totalParticipants}`);
        console.log(`   Total Tickets: ${result.totalTickets}`);
      }
      
      if (action === 'start_next_raffle') {
        console.log(`\\n🚀 New Raffle Details:`);
        console.log(`   Raffle ID: ${result.raffleId}`);
        console.log(`   Day Number: ${result.dayNumber}`);
        console.log(`   Start: ${result.startDate}`);
        console.log(`   End: ${result.endDate}`);
      }
      
    } else {
      console.log('❌ Action failed!');
      console.log('📊 Error:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

async function showApiInfo() {
  console.log('📋 Daily Raffle Automation API Info');
  
  try {
    const response = await fetch(`${baseUrl}/api/automation/daily-raffle`);
    const info = await response.json();
    console.log(JSON.stringify(info, null, 2));
  } catch (error) {
    console.error('❌ Could not fetch API info:', error);
  }
}

// Parse command line arguments
const action = process.argv[2];

const validActions = [
  'execute_daily_raffle',
  'start_next_raffle',
  'full_daily_cycle',
  'info'
];

if (!action || !validActions.includes(action)) {
  console.log('🎯 Like2Win Daily Raffle Manual Execution');
  console.log('\\nUsage:');
  console.log('  node scripts/manual-daily-execution.js <action>');
  console.log('\\nAvailable actions:');
  console.log('  execute_daily_raffle  - Execute current daily raffle (23:59)');
  console.log('  start_next_raffle     - Start next daily raffle (00:01)');
  console.log('  full_daily_cycle      - Execute current + start next');
  console.log('  info                  - Show API information');
  console.log('\\nExamples:');
  console.log('  node scripts/manual-daily-execution.js execute_daily_raffle');
  console.log('  node scripts/manual-daily-execution.js full_daily_cycle');
  process.exit(1);
}

// Execute the requested action
if (action === 'info') {
  showApiInfo();
} else {
  executeDailyRaffleAction(action);
}