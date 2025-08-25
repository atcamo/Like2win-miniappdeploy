// Limpiar datos mockeados directamente
require('dotenv').config({ path: '.env.local' });

async function cleanFakeData() {
  console.log('🧹 Starting direct fake data cleanup...');

  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    // 1. First check what exists
    console.log('📋 Checking current fake data...');
    
    const checkFakeTickets = await pool.query(`
      SELECT "raffleId", "userFid", "ticketsCount", "createdAt"
      FROM user_tickets
      WHERE "userFid" = 12345
    `);
    
    console.log(`Found ${checkFakeTickets.rows.length} fake ticket records:`);
    checkFakeTickets.rows.forEach((row, i) => {
      console.log(`  ${i+1}. FID ${row.userFid}: ${row.ticketsCount} tickets`);
    });

    const checkFakeUsers = await pool.query(`
      SELECT fid, username, "displayName", "totalLifetimeTickets"
      FROM users
      WHERE fid = '12345'
    `);
    
    console.log(`Found ${checkFakeUsers.rows.length} fake user records:`);
    checkFakeUsers.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.username} (${row.fid}): ${row.totalLifetimeTickets} lifetime tickets`);
    });

    if (checkFakeTickets.rows.length === 0 && checkFakeUsers.rows.length === 0) {
      console.log('✅ No fake data found to clean!');
      return;
    }

    // 2. Start transaction
    console.log('\n🗑️ Starting cleanup...');
    await pool.query('BEGIN');

    // 3. Delete fake data
    const deleteTickets = await pool.query(`
      DELETE FROM user_tickets 
      WHERE "userFid" = 12345
    `);
    console.log(`✅ Deleted ${deleteTickets.rowCount} fake ticket records`);

    const deleteUsers = await pool.query(`
      DELETE FROM users 
      WHERE fid = '12345'
    `);
    console.log(`✅ Deleted ${deleteUsers.rowCount} fake user records`);

    const deleteEngagement = await pool.query(`
      DELETE FROM engagement_log 
      WHERE "userFid" = '12345'
    `);
    console.log(`✅ Deleted ${deleteEngagement.rowCount} fake engagement records`);

    // 4. Update raffle totals
    const updateRaffles = await pool.query(`
      UPDATE raffles SET 
        "totalTickets" = (
          SELECT COALESCE(SUM("ticketsCount"), 0) 
          FROM user_tickets 
          WHERE "raffleId" = raffles.id
        ), 
        "totalParticipants" = (
          SELECT COUNT(DISTINCT "userFid") 
          FROM user_tickets 
          WHERE "raffleId" = raffles.id
        )
      WHERE status = 'ACTIVE'
    `);
    console.log(`✅ Updated ${updateRaffles.rowCount} active raffles`);

    // 5. Commit transaction
    await pool.query('COMMIT');
    
    console.log('\n🎉 Cleanup completed successfully!');
    
    // 6. Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const verifyTickets = await pool.query(`
      SELECT COUNT(*) as count FROM user_tickets WHERE "userFid" = 12345
    `);
    const verifyUsers = await pool.query(`
      SELECT COUNT(*) as count FROM users WHERE fid = '12345'
    `);
    
    console.log(`Remaining fake tickets: ${verifyTickets.rows[0].count}`);
    console.log(`Remaining fake users: ${verifyUsers.rows[0].count}`);

    // 7. Show updated raffle stats
    const raffleStats = await pool.query(`
      SELECT id, "weekPeriod", "totalTickets", "totalParticipants"
      FROM raffles 
      WHERE status = 'ACTIVE'
    `);
    
    if (raffleStats.rows.length > 0) {
      const raffle = raffleStats.rows[0];
      console.log(`\n📊 Updated raffle stats:`);
      console.log(`   Period: ${raffle.weekPeriod}`);
      console.log(`   Participants: ${raffle.totalParticipants}`);
      console.log(`   Total tickets: ${raffle.totalTickets}`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    await pool.query('ROLLBACK');
  } finally {
    await pool.end();
  }
}

cleanFakeData().catch(console.error);