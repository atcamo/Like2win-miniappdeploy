export async function GET() {
  // Force cache refresh by adding timestamp
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjEyMDY2MTIsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhCMzIxMTUzMTY3RUE3RmZBMzFCNUY3YzU4QmZkN0JhQjM1MTIyMkFmIn0",
      payload: "eyJkb21haW4iOiJsaWtlMndpbi1hcHAudmVyY2VsLmFwcCJ9",
      signature: "I+fx5azBdC2kJJIaxFM2AjKAlvhuPr1Pj5K9vjMftfB8AablVBIV7TKdyG/rDs3RA5+dzUg7XjWca0yk8u9/Uhs="
    },
    frame: {
      version: "1",
      name: "Like2Win",
      homeUrl: "https://like2win-app.vercel.app",
      iconUrl: "https://like2win-app.vercel.app/icon.png",
      splashImageUrl: "https://like2win-app.vercel.app/splash.png",
      splashBackgroundColor: "#F59E0B",
      webhookUrl: "https://like2win-app.vercel.app/api/webhook",
      subtitle: "Follow and Participate to Win",
      description: "Social engagement on Farcaster with bi-weekly DEGEN raffles. DEGEN users only like. Non-DEGEN users like, recast and comment. Zero friction rewards.",
      screenshotUrls: [
        "https://like2win-app.vercel.app/screenshot.png"
      ],
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
  };

  return new Response(JSON.stringify(manifest, null, 2), { headers });
}
