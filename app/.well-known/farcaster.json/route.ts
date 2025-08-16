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
      header: "eyJmaWQiOjEwNjg1LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NDRmNGEyM0U4NDEwNDkxMmFDNDhkMUJhRTg2NGQwYWVmRTRkREQ0QSJ9",
      payload: "eyJkb21haW4iOiJsaWtlMndpbi1taW5pYXBwZGVwbG95LnZlcmNlbC5hcHAifQ==",
      signature: "MHg3NzA1MzUxOGUxNzVhZjYxMzEyZjRhNDdiZGU3YWRmNmFhZmE4NGE2YjI5ZDEyOGI5YjAyZmY5ZjBiODIwYTgwNjAyZWNhNWQ0MTA1ZjBjM2NlZWI4ZjBiZWZjZTM3ZGVjZjlkYTlmODUwOTQxNzVhZDY4OGVhM2Y2MzJiNzE0MDFi"
    },
    frame: {
      version: "1",
      name: "Like2Win",
      homeUrl: "https://like2win-miniappdeploy.vercel.app",
      iconUrl: "https://like2win-miniappdeploy.vercel.app/icon.png",
      splashImageUrl: "https://like2win-miniappdeploy.vercel.app/splash.png",
      splashBackgroundColor: "#F59E0B",
      webhookUrl: "https://like2win-miniappdeploy.vercel.app/api/webhook",
      subtitle: "Follow + Participate = Win $DEGEN",
      description: "Experience the future of social engagement on Farcaster. Follow @Like2Win and participate in bi-weekly $DEGEN raffles. Con 🎩 DEGEN: solo like. Sin 🎩: like + recast + comment. Zero friction, maximum rewards!",
      screenshotUrls: [
        "https://like2win-miniappdeploy.vercel.app/screenshot.png"
      ],
      primaryCategory: "social",
      tags: ["degen", "social", "rewards", "farcaster", "gamification", "raffles"],
      heroImageUrl: "https://like2win-miniappdeploy.vercel.app/hero.png",
      tagline: "Con 🎩 DEGEN: solo like. Sin 🎩: like + recast + comment",
      ogTitle: "Like2Win - Social Gamification Platform",
      ogDescription: "🎫 La forma más simple de ganar $DEGEN en Farcaster. Con 🎩 DEGEN: solo like. Sin 🎩: like + recast + comment. Sorteos bi-semanales.",
      ogImageUrl: "https://like2win-miniappdeploy.vercel.app/hero.png",
      imageUrl: "https://like2win-miniappdeploy.vercel.app/hero.png",
      buttonTitle: "Launch Like2Win"
    }
  };

  return new Response(JSON.stringify(manifest, null, 2), { headers });
}
