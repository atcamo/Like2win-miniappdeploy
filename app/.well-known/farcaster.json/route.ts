export async function GET() {
  // Force cache refresh by adding timestamp - Base Builder integration
  const timestamp = new Date().toISOString();
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Last-Modified': timestamp
  };

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjEyMDY2MTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhFOWZFNDhDYzcyMzMxYjNEZkRjZDAzNDU5MzE4MDRFNTA3NDYyNzdGIn0",
      payload: "eyJkb21haW4iOiJsaWtlMndpbi1hcHAudmVyY2VsLmFwcCJ9",
      signature: "MHg3ZTdhNjQ4NmY3NzhhMDAzOGM2N2Q3MzZmMjNhYWQ1M2FkODdmMTliNGU1ZWEyODhlNjA5ODIxMDhiY2JhMjEzNjU1MDQwZGVkOWYxYzJhZDMwMzcwM2RhNGMwOGNmMDFkYTVkMmE1YjhmOGRkZDg4MDVjNGI3OGQyN2QxMWNmMDFi"
    },
    miniapp: {
      version: "1",
      name: "Like2Win",
      homeUrl: "https://like2win-app.vercel.app",
      iconUrl: `https://like2win-app.vercel.app/icon.png?v=${Date.now()}`,
      splashImageUrl: `https://like2win-app.vercel.app/splash.png?v=${Date.now()}`,
      splashBackgroundColor: "#000000ff",
      webhookUrl: "https://like2win-app.vercel.app/api/webhook",
      subtitle: "Follow and Participate to Win",
      description: "Social engagement with daily DEGEN raffles. DEGEN users only like. Non-DEGEN users like, recast and comment. Zero friction rewards.",
      screenshotUrls: [
        `https://like2win-app.vercel.app/screenshot.png?v=${Date.now()}`
      ],
      primaryCategory: "social",
      tags: ["degen", "social", "rewards", "gamification", "raffles"],
      heroImageUrl: `https://like2win-app.vercel.app/hero.png?v=${Date.now()}`,
      tagline: "DEGEN like, others do more",
      ogTitle: "Like2Win Social Rewards",
      ogDescription: "Win DEGEN tokens on Farcaster. DEGEN users like, others like recast and comment for tickets.",
      ogImageUrl: `https://like2win-app.vercel.app/hero.png?v=${Date.now()}`,
      imageUrl: `https://like2win-app.vercel.app/hero.png?v=${Date.now()}`,
      buttonTitle: "Launch Like2Win",
      requiredChains: ["eip155:8453"], // Base chain
      noindex: false // Include in discovery
    },
    // Base Builder verification for mini app ownership
    baseBuilder: {
      allowedAddresses: ["0xeeddD28142417ADda1bd1C64dD158aA53De4CAa6"]
    },
    // For backward compatibility
    frame: {
      version: "1",
      name: "Like2Win",
      homeUrl: "https://like2win-app.vercel.app",
      iconUrl: `https://like2win-app.vercel.app/icon.png?v=${Date.now()}`,
      splashImageUrl: `https://like2win-app.vercel.app/splash.png?v=${Date.now()}`,
      splashBackgroundColor: "#000000ff",
      webhookUrl: "https://like2win-app.vercel.app/api/webhook",
      subtitle: "Follow and Participate to Win",
      description: "Social engagement with daily DEGEN raffles. DEGEN users only like. Non-DEGEN users like, recast and comment. Zero friction rewards.",
      screenshotUrls: [
        `https://like2win-app.vercel.app/screenshot.png?v=${Date.now()}`
      ],
      primaryCategory: "social",
      tags: ["degen", "social", "rewards", "gamification", "raffles"],
      heroImageUrl: `https://like2win-app.vercel.app/hero.png?v=${Date.now()}`,
      tagline: "DEGEN like, others do more",
      ogTitle: "Like2Win Social Rewards",
      ogDescription: "Win DEGEN tokens on Farcaster. DEGEN users like, others like recast and comment for tickets.",
      ogImageUrl: `https://like2win-app.vercel.app/hero.png?v=${Date.now()}`,
      imageUrl: `https://like2win-app.vercel.app/hero.png?v=${Date.now()}`,
      buttonTitle: "Launch Like2Win"
    }
  };

  return new Response(JSON.stringify(manifest, null, 2), { headers });
}
