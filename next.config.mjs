/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  
  // Enhanced CSP Headers for security and Farcaster Frame embedding
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    const cspDirectives = [
      "default-src 'self'",
      // Note: 'unsafe-eval' needed for OnchainKit and Wagmi libraries in development
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://*.coinbase.com https://*.vercel.app https://*.vercel.com https://challenges.cloudflare.com https://minikit.farcaster.com https://*.farcaster.xyz https://*.warpcast.com https://auth.privy.io https://*.privy.io`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://farcaster.xyz https://client.farcaster.xyz https://warpcast.com https://client.warpcast.com https://wrpcd.net https://*.wrpcd.net https://privy.farcaster.xyz https://privy.warpcast.com https://auth.privy.io https://*.rpc.privy.systems https://cloudflareinsights.com https://explorer-api.walletconnect.com https://*.coinbase.com https://*.neynar.com https://*.vercel.app https://*.vercel.com wss://*.coinbase.com https://minikit.farcaster.com",
      "frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com https://*.neynar.com https://*.vercel.app",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
      {
        source: '/miniapp/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://minikit.farcaster.com https://*.farcaster.xyz https://*.warpcast.com https://auth.privy.io https://*.privy.io; connect-src 'self' https://farcaster.xyz https://client.farcaster.xyz https://warpcast.com https://client.warpcast.com https://wrpcd.net https://*.wrpcd.net https://privy.farcaster.xyz https://privy.warpcast.com https://auth.privy.io https://*.rpc.privy.systems https://cloudflareinsights.com https://explorer-api.walletconnect.com; frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com https://*.neynar.com; img-src 'self' data: blob: https: http:; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
