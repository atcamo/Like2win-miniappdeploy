import { NextRequest, NextResponse } from 'next/server';

// Redirect to working endpoint to avoid Prisma conflicts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fidParam = searchParams.get('fid');
  
  if (!fidParam) {
    return NextResponse.json(
      { error: 'FID parameter is required' },
      { status: 400 }
    );
  }

  // Redirect to the working mock endpoint
  return NextResponse.redirect(
    new URL(`/api/raffle/status-direct?fid=${fidParam}`, request.url)
  );
}