import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin endpoint to fix the daily raffle system
 * - Close old long-running raffle  
 * - Create new daily raffle for today
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Admin: Fixing daily raffle system...');
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // 1. Close old raffle(s)
      console.log('🔒 Closing old active raffles...');
      const closeResult = await pool.query(`
        UPDATE raffles SET 
          status = 'COMPLETED',
          "executedAt" = NOW()
        WHERE status = 'ACTIVE' 
        AND "endDate" > NOW() + INTERVAL '1 day'
        RETURNING id, "weekPeriod"
      `);
      
      console.log(`✅ Closed ${closeResult.rows.length} old raffles`);
      closeResult.rows.forEach(raffle => {
        console.log(`   - ${raffle.weekPeriod} (${raffle.id})`);
      });
      
      // 2. Check if there's already a daily raffle for today
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      const existingDaily = await pool.query(`
        SELECT id, "weekPeriod" FROM raffles 
        WHERE status = 'ACTIVE' 
        AND "startDate" >= $1 
        AND "endDate" <= $2
      `, [todayStart, todayEnd]);
      
      if (existingDaily.rows.length > 0) {
        console.log('✅ Daily raffle already exists:', existingDaily.rows[0].weekPeriod);
        return NextResponse.json({
          success: true,
          message: 'Daily raffle already exists',
          raffle: existingDaily.rows[0]
        });
      }
      
      // 3. Create today's daily raffle
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1, 0, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const weekPeriod = `Daily ${startDate.toISOString().split('T')[0]}`;
      
      console.log('🚀 Creating daily raffle:', weekPeriod);
      console.log(`   ${startDate.toISOString()} → ${endDate.toISOString()}`);
      
      const newRaffle = await pool.query(`
        INSERT INTO raffles (
          id, "weekPeriod", "startDate", "endDate", 
          "totalPool", status, "createdAt",
          "totalTickets", "totalParticipants"
        ) VALUES (
          gen_random_uuid(), 
          $1, $2, $3, 500, 'ACTIVE', NOW(), 0, 0
        ) RETURNING id, "weekPeriod", "startDate", "endDate"
      `, [weekPeriod, startDate, endDate]);
      
      console.log('✅ Created daily raffle:', newRaffle.rows[0]);
      
      // 4. Verify current active raffles
      const activeRaffles = await pool.query(`
        SELECT id, "weekPeriod", "startDate", "endDate", status 
        FROM raffles 
        WHERE status = 'ACTIVE'
        ORDER BY "createdAt" DESC
      `);
      
      return NextResponse.json({
        success: true,
        message: 'Daily raffle system fixed successfully',
        oldRafflesClosed: closeResult.rows.length,
        newRaffle: newRaffle.rows[0],
        activeRaffles: activeRaffles.rows,
        timestamp: new Date().toISOString()
      });
      
    } finally {
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Error fixing daily raffle:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix daily raffle system',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Daily Raffle Fix Endpoint',
    description: 'Admin tool to transition from old raffle system to daily raffles',
    usage: 'POST to this endpoint to close old raffles and create daily raffle',
    timestamp: new Date().toISOString()
  });
}