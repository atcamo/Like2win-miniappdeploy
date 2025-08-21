import { NextRequest, NextResponse } from 'next/server';

/**
 * Simplified engagement test - Award tickets directly without complex validation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userFid = searchParams.get('userFid') || '12345';
    
    console.log('🎯 Simple engagement test for user:', userFid);
    
    // Get database connection
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not configured'
      });
    }

    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      // Get the current raffle (any active raffle)
      const raffleResult = await pool.query(`
        SELECT id, weekPeriod, startDate, endDate, status, totalTickets, totalParticipants
        FROM raffles 
        WHERE status = 'ACTIVE'
        ORDER BY createdAt DESC 
        LIMIT 1
      `);

      if (raffleResult.rows.length === 0) {
        await pool.end();
        return NextResponse.json({
          success: false,
          message: 'No active raffle found',
          userFid
        });
      }

      const raffle = raffleResult.rows[0];
      console.log('✅ Found raffle:', raffle.id);

      // Check if user already has tickets
      const existingTicketsResult = await pool.query(`
        SELECT ticketsCount FROM user_tickets 
        WHERE raffleId = $1 AND userFid = $2
      `, [raffle.id, userFid]);

      let currentTickets = 0;
      if (existingTicketsResult.rows.length > 0) {
        currentTickets = parseInt(existingTicketsResult.rows[0].ticketscount || existingTicketsResult.rows[0].ticketsCount);
      }

      // Award 1 more ticket
      const newTicketCount = currentTickets + 1;
      
      // Upsert user tickets
      await pool.query(`
        INSERT INTO user_tickets (raffleId, userFid, ticketsCount, createdAt)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (raffleId, userFid) 
        DO UPDATE SET ticketsCount = $3
      `, [raffle.id, userFid, newTicketCount]);

      // Ensure user exists
      await pool.query(`
        INSERT INTO users (fid, createdAt)
        VALUES ($1, NOW())
        ON CONFLICT (fid) DO NOTHING
      `, [userFid]);

      // Update raffle totals
      await pool.query(`
        UPDATE raffles SET 
          totalTickets = (
            SELECT COALESCE(SUM(ticketsCount), 0) 
            FROM user_tickets 
            WHERE raffleId = $1
          ),
          totalParticipants = (
            SELECT COUNT(DISTINCT userFid) 
            FROM user_tickets 
            WHERE raffleId = $1
          )
        WHERE id = $1
      `, [raffle.id]);

      await pool.end();

      return NextResponse.json({
        success: true,
        message: 'Ticket awarded successfully!',
        data: {
          userFid,
          raffleId: raffle.id,
          weekPeriod: raffle.weekperiod || raffle.weekPeriod,
          previousTickets: currentTickets,
          newTickets: newTicketCount,
          ticketsAwarded: 1,
          timestamp: new Date().toISOString()
        }
      });

    } catch (dbError) {
      await pool.end();
      console.error('❌ Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : String(dbError),
        userFid
      });
    }

  } catch (error) {
    console.error('❌ Simple test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * POST endpoint for manual testing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userFid = body.userFid || '12345';
    
    // Redirect to GET with userFid
    const url = new URL(request.url);
    url.searchParams.set('userFid', userFid);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'POST processing failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}