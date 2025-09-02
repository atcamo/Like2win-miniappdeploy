export async function GET() {
  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjEyMDY2MTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhFOWZFNDhDYzcyMzMxYjNEZkRjZDAzNDU5MzE4MDRFNTA3NDYyNzdGIn0",
      payload: "eyJkb21haW4iOiJsaWtlMndpbi1hcHAudmVyY2VsLmFwcCJ9",
      signature: "MHg3ZTdhNjQ4NmY3NzhhMDAzOGM2N2Q3MzZmMjNhYWQ1M2FkODdmMTliNGU1ZWEyODhlNjA5ODIxMDhiY2JhMjEzNjU1MDQwZGVkOWYxYzJhZDMwMzcwM2RhNGMwOGNmMDFkYTVkMmE1YjhmOGRkZDg4MDVjNGI3OGQyN2QxMWNmMDFi"
    },
    miniapp: {
      version: "1",
      name: "Like2Win",
      homeUrl: "https://like2win-app.vercel.app",
      iconUrl: "https://like2win-app.vercel.app/icon.png",
      splashImageUrl: "https://like2win-app.vercel.app/splash.png",
      splashBackgroundColor: "#000000ff",
      webhookUrl: "https://like2win-app.vercel.app/api/webhook",
      subtitle: "Follow and Participate to Win",
      description: "Social engagement with daily DEGEN raffles. DEGEN users only like. Non-DEGEN users like, recast and comment. Zero friction rewards.",
      screenshotUrls: ["https://like2win-app.vercel.app/screenshot.png"],
      primaryCategory: "social",
      tags: ["degen", "social", "rewards", "gamification", "raffles"],
      heroImageUrl: "https://like2win-app.vercel.app/hero.png",
      tagline: "DEGEN like, others do more",
      ogTitle: "Like2Win Social Rewards",
      ogDescription: "Win DEGEN tokens on Farcaster. DEGEN users like, others like recast and comment for tickets.",
      ogImageUrl: "https://like2win-app.vercel.app/hero.png",
      imageUrl: "https://like2win-app.vercel.app/hero.png",
      buttonTitle: "Launch Like2Win",
      requiredChains: ["eip155:8453"],
      noindex: false
    },
    baseBuilder: {
      allowedAddresses: ["0xeeddD28142417ADda1bd1C64dD158aA53De4CAa6"]
    },
    frame: {
      version: "1",
      name: "Like2Win",
      homeUrl: "https://like2win-app.vercel.app",
      iconUrl: "https://like2win-app.vercel.app/icon.png",
      splashImageUrl: "https://like2win-app.vercel.app/splash.png",
      splashBackgroundColor: "#000000ff",
      webhookUrl: "https://like2win-app.vercel.app/api/webhook",
      subtitle: "Follow and Participate to Win",
      description: "Social engagement with daily DEGEN raffles. DEGEN users only like. Non-DEGEN users like, recast and comment. Zero friction rewards.",
      screenshotUrls: ["https://like2win-app.vercel.app/screenshot.png"],
      primaryCategory: "social",
      tags: ["degen", "social", "rewards", "gamification", "raffles"],
      heroImageUrl: "https://like2win-app.vercel.app/hero.png",
      tagline: "DEGEN like, others do more",
      ogTitle: "Like2Win Social Rewards",
      ogDescription: "Win DEGEN tokens on Farcaster. DEGEN users like, others like recast and comment for tickets.",
      ogImageUrl: "https://like2win-app.vercel.app/hero.png",
      imageUrl: "https://like2win-app.vercel.app/hero.png",
      buttonTitle: "Launch Like2Win"
    }
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}