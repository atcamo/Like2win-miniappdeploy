import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    await pool.query('DELETE FROM user_tickets WHERE "userFid" = 12345');
    await pool.query('DELETE FROM users WHERE fid = $1', ['12345']);
    await pool.query('UPDATE raffles SET "totalTickets" = (SELECT COALESCE(SUM("ticketsCount"), 0) FROM user_tickets WHERE "raffleId" = raffles.id), "totalParticipants" = (SELECT COUNT(DISTINCT "userFid") FROM user_tickets WHERE "raffleId" = raffles.id) WHERE status = $1', ['ACTIVE']);
    
    return NextResponse.json({ success: true, message: 'FID 12345 deleted' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  } finally {
    await pool.end();
  }
}