import { NextRequest, NextResponse } from 'next/server';

// Forward request to working mock endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the mock endpoint
    const mockResponse = await fetch(new URL('/api/raffle/participate-mock', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    const data = await mockResponse.json();
    
    return NextResponse.json(data, { 
      status: mockResponse.status 
    });

  } catch (error) {
    console.error('Error forwarding participation request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}