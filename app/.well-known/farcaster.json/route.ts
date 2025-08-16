function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || "https://like2win.vercel.app";

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER || "eyJmaWQiOjEwNjg1LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NDRmNGEyM0U4NDEwNDkxMmFDNDhkMUJhRTg2NGQwYWVmRTRkREQ0QSJ9",
      payload: process.env.FARCASTER_PAYLOAD || "eyJkb21haW4iOiJsaWtlMndpbi52ZXJjZWwuYXBwIn0",
      signature: process.env.FARCASTER_SIGNATURE || "MHg3NzA1MzUxOGUxNzVhZjYxMzEyZjRhNDdiZGU3YWRmNmFhZmE4NGE2YjI5ZDEyOGI5YjAyZmY5ZjBiODIwYTgwNjAyZWNhNWQ0MTA1ZjBjM2NlZWI4ZjBiZWZjZTM3ZGVjZjlkYTlmODUwOTQxNzVhZDY4OGVhM2Y2MzJiNzE0MDFi",
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Like2Win",
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE || "Follow + Participate = Win $DEGEN",
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "La forma más simple de ganar $DEGEN en Farcaster. Follow @Like2Win y participa según tu tipo: Con 🎩 DEGEN: solo like. Sin 🎩: like + recast + comment. Sorteos bi-semanales de $DEGEN.",
      screenshotUrls: process.env.NEXT_PUBLIC_APP_SCREENSHOT_URLS?.split(',') || [`${URL}/screenshot.png`],
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON || `${URL}/icon.png`,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${URL}/splash.png`,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#F59E0B",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "social",
      tags: ["degen", "social", "rewards", "farcaster", "gamification", "raffles"],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/hero.png`,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Con 🎩 DEGEN: solo like. Sin 🎩: like + recast + comment",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "Like2Win - Social Gamification Platform",
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION || "🎫 La forma más simple de ganar $DEGEN en Farcaster. Con 🎩 DEGEN: solo like. Sin 🎩: like + recast + comment. Sorteos bi-semanales.",
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE || `${URL}/hero.png`,
      buttonTitle: "Launch Like2Win",
      imageUrl: `${URL}/hero.png`,
    }),
  });
}
