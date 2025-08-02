import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers for cookie handling
  if (request.nextUrl.pathname.startsWith('/miniapp')) {
    // Allow iframe embedding for Farcaster
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    
    // Set cookie security attributes
    const cookieOptions = [
      'SameSite=None',
      'Secure', 
      'Partitioned'
    ].join('; ');
    
    response.headers.set('Set-Cookie-Options', cookieOptions);
  }

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/miniapp/:path*',
    '/api/:path*',
  ],
};