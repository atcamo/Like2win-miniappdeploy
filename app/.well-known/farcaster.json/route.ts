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
      header: "eyJmaWQiOjEyMDY2MTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhFOWZFNDhDYzcyMzMxYjNEZkRjZDAzNDU5MzE4MDRFNTA3NDYyNzdGIn0",
      payload: "eyJkb21haW4iOiJsaWtlMndpbi1taW5pYXBwZGVwbG95LnZlcmNlbC5hcHAifQ",
      signature: "MHg1M2E3MWFjNjI2ODFjNDlmZTMyMjU1YjE2ZDcwZjIyMGI4NmY0NDM3ZGE4NGY3ODk3ZDFlZTQ3Yjc1MzlmY2IwMDI5MmNhNTljMWFkYjVkOTNmMDI3NzI1NjllOTU3ZmQ1YzU0MjRjMjFlNGRjYjZlNWVkY2UyYjZhMDc0NzczYTFj"
    },
    frame: {
      version: "1",
      name: "Like2Win",
      homeUrl: "https://like2win-miniappdeploy.vercel.app",
      iconUrl: "https://like2win-miniappdeploy.vercel.app/icon.png",
      splashImageUrl: "https://like2win-miniappdeploy.vercel.app/splash.png",
      splashBackgroundColor: "#F59E0B",
      webhookUrl: "https://like2win-miniappdeploy.vercel.app/api/webhook",
      subtitle: "Follow and Participate to Win",
      description: "Social engagement on Farcaster with bi-weekly DEGEN raffles. DEGEN users only like. Non-DEGEN users like, recast and comment. Zero friction rewards.",
      screenshotUrls: [
        "https://like2win-miniappdeploy.vercel.app/screenshot.png"
      ],
      primaryCategory: "social",
      tags: ["degen", "social", "rewards", "gamification", "raffles"],
      heroImageUrl: "https://like2win-miniappdeploy.vercel.app/hero.png",
      tagline: "DEGEN like, others do more",
      ogTitle: "Like2Win Social Rewards",
      ogDescription: "Win DEGEN tokens on Farcaster. DEGEN users like, others like recast and comment for tickets.",
      ogImageUrl: "https://like2win-miniappdeploy.vercel.app/hero.png",
      imageUrl: "https://like2win-miniappdeploy.vercel.app/hero.png",
      buttonTitle: "Launch Like2Win"
    }
  };

  return new Response(JSON.stringify(manifest, null, 2), { headers });
}
