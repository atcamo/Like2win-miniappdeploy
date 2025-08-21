const { Pool } = require('pg');

async function addDemoTickets() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    console.log('🎯 Adding demo tickets for user FID 546204...');

    // Get the active raffle
    const raffleResult = await pool.query(`
      SELECT id, "weekPeriod", "startDate", "endDate"
      FROM raffles 
      WHERE status = 'ACTIVE' 
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `);

    if (raffleResult.rows.length === 0) {
      console.log('❌ No active raffle found');
      return;
    }

    const raffle = raffleResult.rows[0];
    console.log('✅ Found active raffle:', raffle.id, 'for period:', raffle.weekPeriod);

    const userFid = '546204';
    const ticketsToAdd = 5; // Add 5 demo tickets
    const timestamp = new Date();

    // Start transaction
    await pool.query('BEGIN');

    try {
      // 1. Ensure user exists
      await pool.query(`
        INSERT INTO users (fid, "createdAt")
        VALUES ($1, $2)
        ON CONFLICT (fid) DO NOTHING
      `, [userFid, timestamp]);

      // 2. Add engagement logs (simulate 5 likes)
      for (let i = 1; i <= ticketsToAdd; i++) {
        await pool.query(`
          INSERT INTO engagement_log ("raffleId", "userFid", "castHash", type, "createdAt")
          VALUES ($1, $2, $3, $4, $5)
        `, [raffle.id, userFid, `demo_like_${userFid}_${i}`, 'like', timestamp]);
      }

      // 3. Add or update user tickets
      await pool.query(`
        INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount", "createdAt")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("raffleId", "userFid") 
        DO UPDATE SET "ticketsCount" = user_tickets."ticketsCount" + $3
      `, [raffle.id, userFid, ticketsToAdd, timestamp]);

      // 4. Update raffle totals
      await pool.query(`
        UPDATE raffles SET 
          "totalTickets" = (
            SELECT COALESCE(SUM("ticketsCount"), 0) 
            FROM user_tickets 
            WHERE "raffleId" = $1
          ),
          "totalParticipants" = (
            SELECT COUNT(DISTINCT "userFid") 
            FROM user_tickets 
            WHERE "raffleId" = $1
          )
        WHERE id = $1
      `, [raffle.id]);

      await pool.query('COMMIT');

      console.log(`✅ Successfully added ${ticketsToAdd} tickets to user ${userFid}`);

      // Verify the result
      const verifyResult = await pool.query(`
        SELECT "ticketsCount" FROM user_tickets 
        WHERE "raffleId" = $1 AND "userFid" = $2
      `, [raffle.id, userFid]);

      if (verifyResult.rows.length > 0) {
        console.log(`🎫 User ${userFid} now has ${verifyResult.rows[0].ticketsCount} tickets`);
      }

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Error adding demo tickets:', error);
  } finally {
    await pool.end();
  }
}

// Only run if this script is called directly
if (require.main === module) {
  addDemoTickets();
}

module.exports = { addDemoTickets };