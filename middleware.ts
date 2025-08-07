import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set permissive CSP for ALL routes to ensure maximum compatibility
  const cspValue = "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https: wss:; frame-ancestors 'self' https:; img-src 'self' data: blob: https: http:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https:;";
  
  response.headers.set('X-Frame-Options', 'ALLOWALL');
  response.headers.set('Content-Security-Policy', cspValue);

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
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Farcaster-Frame');
    
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};