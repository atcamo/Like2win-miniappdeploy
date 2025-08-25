// Verificar y limpiar datos mockeados de la base de datos
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log('🔍 Checking database for mocked data...');

  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    // 1. Check current raffles
    console.log('\n📊 Current raffles:');
    const rafflesResult = await pool.query(`
      SELECT id, "weekPeriod", "startDate", "endDate", status, 
             "totalTickets", "totalParticipants", "createdAt"
      FROM raffles 
      ORDER BY "createdAt" DESC 
      LIMIT 5
    `);

    rafflesResult.rows.forEach((raffle, i) => {
      console.log(`  ${i+1}. ${raffle.weekPeriod} (${raffle.status}) - ${raffle.totalParticipants} participants, ${raffle.totalTickets} tickets`);
      console.log(`     Period: ${raffle.startDate} to ${raffle.endDate}`);
    });

    // 2. Check user tickets - look for obviously fake data
    console.log('\n🎫 Current user tickets:');
    const ticketsResult = await pool.query(`
      SELECT ut."raffleId", ut."userFid", ut."ticketsCount", 
             ut."firstLikeAt", ut."lastLikeAt", ut."createdAt",
             r."weekPeriod"
      FROM user_tickets ut
      LEFT JOIN raffles r ON ut."raffleId" = r.id
      ORDER BY ut."ticketsCount" DESC, ut."userFid" ASC
    `);

    ticketsResult.rows.forEach((ticket, i) => {
      const suspiciousFid = ticket.userFid === 12345 || ticket.userFid === 67890;
      const roundNumber = ticket.ticketsCount % 5 === 0 || ticket.ticketsCount === 18 || ticket.ticketsCount === 25;
      const isSuspicious = suspiciousFid || (roundNumber && ticket.ticketsCount > 10);
      
      console.log(`  ${i+1}. FID ${ticket.userFid}: ${ticket.ticketsCount} tickets (${ticket.weekPeriod}) ${isSuspicious ? '🚨 SUSPICIOUS' : ''}`);
    });

    // 3. Check engagement logs
    console.log('\n📝 Engagement logs summary:');
    const engagementResult = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(DISTINCT "userFid") as unique_users,
             COUNT(CASE WHEN "hasLiked" = true THEN 1 END) as likes,
             MIN("createdAt") as first_engagement,
             MAX("createdAt") as last_engagement
      FROM engagement_log
    `);

    if (engagementResult.rows.length > 0) {
      const stats = engagementResult.rows[0];
      console.log(`  Total engagements: ${stats.total}`);
      console.log(`  Unique users: ${stats.unique_users}`);
      console.log(`  Likes: ${stats.likes}`);
      console.log(`  First: ${stats.first_engagement}`);
      console.log(`  Last: ${stats.last_engagement}`);
    }

    // 4. Check users table
    console.log('\n👥 Users table summary:');
    const usersResult = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN "isFollowingLike2Win" = true THEN 1 END) as following_like2win,
             COUNT(CASE WHEN "totalLifetimeTickets" > 0 THEN 1 END) as users_with_tickets
      FROM users
    `);

    if (usersResult.rows.length > 0) {
      const stats = usersResult.rows[0];
      console.log(`  Total users: ${stats.total}`);
      console.log(`  Following Like2Win: ${stats.following_like2win}`);
      console.log(`  With tickets: ${stats.users_with_tickets}`);
    }

    // 5. Identify clearly fake data to remove
    console.log('\n🧹 Identifying fake data to clean...');
    
    // Check for obviously fake FIDs (12345, 67890, etc.)
    const fakeTicketsResult = await pool.query(`
      SELECT "raffleId", "userFid", "ticketsCount"
      FROM user_tickets
      WHERE "userFid" IN (12345, 67890, 11111, 22222, 99999)
      ORDER BY "userFid"
    `);

    if (fakeTicketsResult.rows.length > 0) {
      console.log('  🚨 Found fake user tickets:');
      fakeTicketsResult.rows.forEach((fake, i) => {
        console.log(`    ${i+1}. FID ${fake.userFid}: ${fake.ticketsCount} tickets`);
      });

      // Ask for confirmation to delete
      console.log('\n❓ Do you want to delete these fake entries? (This script will show what would be deleted)');
      console.log('\n🗑️  SQL commands that would clean the data:');
      
      console.log(`DELETE FROM user_tickets WHERE "userFid" IN (12345, 67890, 11111, 22222, 99999);`);
      console.log(`DELETE FROM users WHERE fid IN ('12345', '67890', '11111', '22222', '99999');`);
      console.log(`DELETE FROM engagement_log WHERE "userFid" IN ('12345', '67890', '11111', '22222', '99999');`);
      console.log(`\n-- Then update raffle totals`);
      console.log(`UPDATE raffles SET "totalTickets" = (
        SELECT COALESCE(SUM("ticketsCount"), 0) 
        FROM user_tickets 
        WHERE "raffleId" = raffles.id
      ), "totalParticipants" = (
        SELECT COUNT(DISTINCT "userFid") 
        FROM user_tickets 
        WHERE "raffleId" = raffles.id
      );`);
      
    } else {
      console.log('  ✅ No obviously fake FIDs found');
    }

    // 6. Look for other suspicious patterns
    const suspiciousResult = await pool.query(`
      SELECT "userFid", "ticketsCount", "createdAt"
      FROM user_tickets
      WHERE "ticketsCount" IN (25, 18) OR ("ticketsCount" % 10 = 0 AND "ticketsCount" > 10)
      ORDER BY "ticketsCount" DESC
    `);

    if (suspiciousResult.rows.length > 0) {
      console.log('\n  🤔 Potentially suspicious round numbers:');
      suspiciousResult.rows.forEach((sus, i) => {
        console.log(`    ${i+1}. FID ${sus.userFid}: ${sus.ticketsCount} tickets (created: ${sus.createdAt})`);
      });
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);