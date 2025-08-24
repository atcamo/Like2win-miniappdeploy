import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin API to seed test data for Like2Win leaderboard
 * Only use in development/testing
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Seeding test data for Like2Win...');

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // 1. Create active raffle if doesn't exist
      console.log('📅 Checking for active raffle...');
      const raffleCheck = await pool.query(`
        SELECT id FROM raffles WHERE status = 'ACTIVE' ORDER BY "createdAt" DESC LIMIT 1
      `);

      let raffleId;
      if (raffleCheck.rows.length === 0) {
        console.log('🆕 Creating new active raffle...');
        const raffleResult = await pool.query(`
          INSERT INTO raffles (
            "weekPeriod", "startDate", "endDate", status, 
            "totalTickets", "totalParticipants"
          ) VALUES (
            '2025-W04', $1, $2, 'ACTIVE', 0, 0
          ) RETURNING id
        `, [
          new Date('2025-01-20'),
          new Date('2025-02-03')
        ]);
        raffleId = raffleResult.rows[0].id;
        console.log('✅ Raffle created:', raffleId);
      } else {
        raffleId = raffleCheck.rows[0].id;
        console.log('✅ Using existing raffle:', raffleId);
      }

      // 2. Insert test participants with varying ticket counts
      const testUsers = [
        { fid: 432789, tickets: 25 }, // Admin user
        { fid: 123456, tickets: 18 },
        { fid: 234567, tickets: 12 },
        { fid: 345678, tickets: 8 },
        { fid: 456789, tickets: 5 },
        { fid: 567890, tickets: 3 },
        { fid: 678901, tickets: 2 },
        { fid: 789012, tickets: 1 },
        { fid: 890123, tickets: 1 },
        { fid: 901234, tickets: 1 },
        { fid: 1011121, tickets: 7 },
        { fid: 1213141, tickets: 4 },
        { fid: 1516171, tickets: 9 },
        { fid: 1819202, tickets: 6 },
        { fid: 2122232, tickets: 11 }
      ];

      console.log('👥 Inserting test participants...');
      let successCount = 0;
      
      for (const user of testUsers) {
        try {
          await pool.query(`
            INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount", "firstLikeAt", "lastLikeAt")
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT ("raffleId", "userFid") 
            DO UPDATE SET 
              "ticketsCount" = $3,
              "lastLikeAt" = $5
          `, [
            raffleId, 
            user.fid, 
            user.tickets,
            new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last week
            new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random date in last day
          ]);
          
          successCount++;
          console.log(`  ✅ User ${user.fid}: ${user.tickets} tickets`);
        } catch (error) {
          console.log(`  ⚠️ Error inserting user ${user.fid}:`, error);
        }
      }

      // 3. Update raffle totals
      console.log('📊 Updating raffle totals...');
      const totalTickets = testUsers.reduce((sum, user) => sum + user.tickets, 0);
      const totalParticipants = successCount;

      await pool.query(`
        UPDATE raffles SET 
          "totalTickets" = $1,
          "totalParticipants" = $2
        WHERE id = $3
      `, [totalTickets, totalParticipants, raffleId]);

      console.log('✅ Test data seeded successfully!');
      
      return NextResponse.json({
        success: true,
        message: 'Test data seeded successfully',
        data: {
          raffleId,
          totalParticipants,
          totalTickets,
          usersInserted: successCount
        }
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed test data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}