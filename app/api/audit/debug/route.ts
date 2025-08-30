import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to test database connection and identify audit API issues
 */
export async function GET() {
  try {
    console.log('🔍 Debug: Starting database connection test...');
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    // Test basic connection
    console.log('🔍 Debug: Testing basic connection...');
    const basicTest = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', basicTest.rows[0]);

    // Check if raffles table exists
    console.log('🔍 Debug: Checking raffles table...');
    const tableCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'raffles'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Raffles table columns:', tableCheck.rows);

    // Check actual raffles data
    console.log('🔍 Debug: Checking raffles data...');
    const raffleData = await pool.query(`
      SELECT COUNT(*) as total_raffles,
             COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_raffles,
             COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_raffles
      FROM raffles
    `);
    
    console.log('📊 Raffles summary:', raffleData.rows[0]);

    // Try to get one sample raffle
    const sampleRaffle = await pool.query(`
      SELECT * FROM raffles LIMIT 1
    `);

    console.log('📄 Sample raffle:', sampleRaffle.rows[0]);

    await pool.end();

    return NextResponse.json({
      success: true,
      debug: {
        connection: 'OK',
        currentTime: basicTest.rows[0],
        tableColumns: tableCheck.rows,
        rafflesSummary: raffleData.rows[0],
        sampleRaffle: sampleRaffle.rows[0] || null,
        environment: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasNeynarKey: !!process.env.NEYNAR_API_KEY,
          nodeEnv: process.env.NODE_ENV
        }
      }
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}