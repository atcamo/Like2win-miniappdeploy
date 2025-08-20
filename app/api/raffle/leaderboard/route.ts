import { NextRequest, NextResponse } from 'next/server';

// Redirect to working mock endpoint to avoid Prisma conflicts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || 'current';
  
  // Redirect to the working mock endpoint
  return NextResponse.redirect(
    new URL(`/api/raffle/leaderboard-mock?period=${period}`, request.url)
  );
}