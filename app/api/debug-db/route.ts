import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to test database connection
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Starting database connection test');
    
    // Check if DATABASE_URL exists
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL not found',
        env_vars: Object.keys(process.env).filter(key => key.includes('DATABASE')),
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('🔍 Debug: DATABASE_URL found, length:', databaseUrl.length);
    console.log('🔍 Debug: DATABASE_URL starts with:', databaseUrl.substring(0, 20));
    
    // Try to connect
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 1
      });
      
      console.log('🔍 Debug: Pool created, testing connection...');
      
      // Simple query to test connection
      const testResult = await pool.query('SELECT NOW() as current_time');
      console.log('🔍 Debug: Connection test successful');
      
      // Test if tables exist
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'raffles', 'user_tickets', 'engagement_log')
        ORDER BY table_name
      `);
      
      console.log('🔍 Debug: Tables query successful');
      
      // Test raffle data - try different column name variations
      let raffleResult;
      try {
        raffleResult = await pool.query(
          'SELECT * FROM raffles WHERE status = $1 ORDER BY created_at DESC LIMIT 1',
          ['ACTIVE']
        );
      } catch (error) {
        console.log('🔍 Debug: Trying alternative column name');
        raffleResult = await pool.query(
          'SELECT * FROM raffles WHERE status = $1 ORDER BY "createdAt" DESC LIMIT 1',
          ['ACTIVE']
        );
      }
      
      console.log('🔍 Debug: Raffle query successful, rows:', raffleResult.rows.length);
      
      await pool.end();
      
      return NextResponse.json({
        success: true,
        database_url_exists: true,
        database_url_preview: databaseUrl.substring(0, 30) + '...',
        connection_test: testResult.rows[0],
        tables_found: tablesResult.rows.map((row: any) => row.table_name),
        active_raffles: raffleResult.rows.length,
        raffle_data: raffleResult.rows[0] || null,
        timestamp: new Date().toISOString()
      });
      
    } catch (dbError) {
      console.error('🔍 Debug: Database error:', dbError);
      return NextResponse.json({
        error: 'Database connection failed',
        database_url_exists: true,
        database_url_preview: databaseUrl.substring(0, 30) + '...',
        db_error: dbError instanceof Error ? dbError.message : String(dbError),
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('🔍 Debug: General error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      general_error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}