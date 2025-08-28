#!/usr/bin/env node

// Create a demo raffle for testing the interface
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function createDemoRaffle() {
  console.log('🎯 Creating demo raffle for Like2Win interface...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Check if there's already an active raffle
    const existingRaffle = await pool.query(`
      SELECT id, "weekPeriod", "startDate", "endDate"
      FROM raffles 
      WHERE status = 'ACTIVE' 
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `);

    if (existingRaffle.rows.length > 0) {
      const raffle = existingRaffle.rows[0];
      console.log('✅ Active raffle already exists:');
      console.log('   - ID:', raffle.id);
      console.log('   - Week Period:', raffle.weekPeriod);
      console.log('   - End Date:', raffle.endDate.toISOString());
      return;
    }

    // Calculate dates for current bi-weekly period
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const year = now.getFullYear();
    
    // Bi-weekly periods: weeks 1-2, 3-4, 5-6, etc.
    const periodNumber = Math.ceil(currentWeek / 2);
    const weekPeriod = `${year}-P${periodNumber}`;
    
    // Start date: beginning of current period (Monday of first week)
    const periodStartWeek = (periodNumber - 1) * 2 + 1;
    const startDate = getFirstDayOfWeek(year, periodStartWeek);
    
    // End date: end of current period (Sunday of second week) + 1 week buffer
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 21); // 3 weeks total
    
    console.log('📅 Creating raffle for period:', weekPeriod);
    console.log('   - Start:', startDate.toISOString());
    console.log('   - End:', endDate.toISOString());

    // Create the raffle
    const result = await pool.query(`
      INSERT INTO raffles (
        "weekPeriod",
        "startDate", 
        "endDate",
        "tipsReceived",
        "userContribution",
        "founderContribution",
        "operationalFee",
        "totalPool",
        "isSelfSustaining",
        "totalParticipants",
        "totalTickets",
        status,
        "createdAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, "weekPeriod"
    `, [
      weekPeriod,
      startDate,
      endDate,
      0,         // tipsReceived
      0,         // userContribution
      100000,    // founderContribution (100k $DEGEN demo pool)
      10000,     // operationalFee (10k $DEGEN)
      90000,     // totalPool (90k $DEGEN available)
      false,     // isSelfSustaining
      0,         // totalParticipants
      0,         // totalTickets
      'ACTIVE',  // status
      now        // createdAt
    ]);

    const newRaffle = result.rows[0];
    
    console.log('🎉 Demo raffle created successfully!');
    console.log('   - Raffle ID:', newRaffle.id);
    console.log('   - Week Period:', newRaffle.weekPeriod);
    console.log('   - Total Pool: 90,000 $DEGEN');
    console.log('   - Status: ACTIVE');
    
    // Create a demo participant with tickets for testing
    const demoFid = 123456;
    console.log(`\n🎫 Creating demo user tickets for FID ${demoFid}...`);
    
    await pool.query(`
      INSERT INTO user_tickets (
        "raffleId",
        "userFid", 
        "ticketsCount",
        "firstLikeAt",
        "lastLikeAt"
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("raffleId", "userFid") 
      DO UPDATE SET 
        "ticketsCount" = EXCLUDED."ticketsCount",
        "lastLikeAt" = EXCLUDED."lastLikeAt"
    `, [
      newRaffle.id,
      demoFid,
      15,        // 15 demo tickets
      now,       // firstLikeAt
      now        // lastLikeAt
    ]);
    
    // Update raffle totals
    await pool.query(`
      UPDATE raffles 
      SET "totalParticipants" = 1, "totalTickets" = 15
      WHERE id = $1
    `, [newRaffle.id]);
    
    console.log(`✅ Demo tickets created: 15 tickets for FID ${demoFid}`);
    
    console.log('\n🎯 Demo raffle ready! You should now see:');
    console.log('   - Active raffle in the interface');
    console.log('   - User tickets count displayed');
    console.log('   - Countdown timer working');
    console.log('   - Leaderboard with demo data');

  } catch (error) {
    console.error('❌ Error creating demo raffle:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Helper functions
function getWeekNumber(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

function getFirstDayOfWeek(year, week) {
  const jan1 = new Date(year, 0, 1);
  const daysToFirstMonday = (8 - jan1.getDay()) % 7;
  const firstMonday = new Date(year, 0, 1 + daysToFirstMonday);
  const targetDate = new Date(firstMonday);
  targetDate.setDate(targetDate.getDate() + (week - 1) * 7);
  return targetDate;
}

// Run the script
createDemoRaffle()
  .then(() => {
    console.log('\n✅ Demo raffle setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });