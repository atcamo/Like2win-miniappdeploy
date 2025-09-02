import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple test endpoint to award tickets directly
 */
export async function POST(request: NextRequest) {
  try {
    const { userFid, raffleId } = await request.json();
    
    console.log('🎯 Test engagement for userFid:', userFid, 'raffleId:', raffleId);

    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    try {
      const userFidBigInt = parseInt(userFid || '546204');
      const targetRaffleId = raffleId || '078adf95-4cc1-4569-9343-0337eb2ba356';

      console.log('📝 Adding ticket for user:', userFidBigInt);
      
      const result = await pool.query(`
        INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount")
        VALUES ($1, $2, 1)
        ON CONFLICT ("raffleId", "userFid") 
        DO UPDATE SET "ticketsCount" = user_tickets."ticketsCount" + 1
        RETURNING "ticketsCount"
      `, [targetRaffleId, userFidBigInt]);

      await pool.end();

      const newTicketCount = result.rows[0]?.ticketsCount || 0;
      console.log('✅ Success! User now has', newTicketCount, 'tickets');

      return NextResponse.json({
        success: true,
        message: 'Ticket awarded successfully',
        data: {
          userFid: userFidBigInt,
          raffleId: targetRaffleId,
          newTicketCount
        }
      });

    } catch (error) {
      await pool.end();
      console.error('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        message: 'Database error',
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: (error as any)?.code,
          detail: (error as any)?.detail
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Test engagement error:', error);
    return NextResponse.json({
      error: 'Test engagement failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Test Engagement Endpoint',
    description: 'Simple ticket awarding test',
    usage: 'POST with userFid and raffleId',
    defaults: {
      userFid: '546204',
      raffleId: '078adf95-4cc1-4569-9343-0337eb2ba356'
    }
  });
}