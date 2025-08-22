import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check Neynar API key status
 */
export async function GET() {
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    
    return NextResponse.json({
      success: true,
      debug: {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        apiKeyFirst4: apiKey ? apiKey.substring(0, 4) : 'none',
        apiKeyLast4: apiKey ? apiKey.substring(apiKey.length - 4) : 'none',
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('NEYNAR')),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Debug Neynar error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}