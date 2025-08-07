import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers for cookie handling - moved to Farcaster section below

  // Add CORS headers for API routes and Farcaster requests
  if (request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname.startsWith('/.well-known/')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Farcaster-Frame'
    );
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }

  // Add Farcaster-specific headers for the miniapp
  if (request.nextUrl.pathname.startsWith('/miniapp')) {
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Farcaster-Frame');
    
    // Set comprehensive CSP for Farcaster compatibility
    const cspValue = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://minikit.farcaster.com https://*.farcaster.xyz https://*.warpcast.com https://auth.privy.io https://*.privy.io https://*.coinbase.com; connect-src 'self' https://farcaster.xyz https://client.farcaster.xyz https://warpcast.com https://client.warpcast.com https://wrpcd.net https://*.wrpcd.net https://privy.farcaster.xyz https://privy.warpcast.com https://auth.privy.io https://*.rpc.privy.systems https://cloudflareinsights.com https://explorer-api.walletconnect.com https://*.walletconnect.com https://*.coinbase.com https://*.neynar.com wss://*.coinbase.com https://minikit.farcaster.com https://api.dune.com https://cca-lite.coinbase.com https://api.developer.coinbase.com; frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com https://*.neynar.com https://wallet.farcaster.xyz https://*.vercel.app; img-src 'self' data: blob: https: http:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;";
    response.headers.set('Content-Security-Policy', cspValue);
    
    // Set cookie security attributes for cross-site embedding
    const cookieOptions = [
      'SameSite=None',
      'Secure', 
      'Partitioned'
    ].join('; ');
    
    response.headers.set('Set-Cookie-Options', cookieOptions);
  }

  return response;
}

export const config = {
  matcher: [
    '/miniapp/:path*',
    '/api/:path*',
    '/.well-known/:path*',
  ],
};