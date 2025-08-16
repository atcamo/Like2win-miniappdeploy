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
  const URL = process.env.NEXT_PUBLIC_URL || "https://like2win-miniappdeploy.vercel.app";

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER || "eyJmaWQiOjEwNjg1LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NDRmNGEyM0U4NDEwNDkxMmFDNDhkMUJhRTg2NGQwYWVmRTRkREQ0QSJ9",
      payload: process.env.FARCASTER_PAYLOAD || "eyJkb21haW4iOiJsaWtlMndpbi1taW5pYXBwZGVwbG95LnZlcmNlbC5hcHAifQ==",
      signature: process.env.FARCASTER_SIGNATURE || "MHg3NzA1MzUxOGUxNzVhZjYxMzEyZjRhNDdiZGU3YWRmNmFhZmE4NGE2YjI5ZDEyOGI5YjAyZmY5ZjBiODIwYTgwNjAyZWNhNWQ0MTA1ZjBjM2NlZWI4ZjBiZWZjZTM3ZGVjZjlkYTlmODUwOTQxNzVhZDY4OGVhM2Y2MzJiNzE0MDFi",
    },
    frame: withValidProperties({
      version: "1",
      name: "Like2Win",
      subtitle: "Follow + Participate = Win $DEGEN",
      description: "Experience the future of social engagement on Farcaster. Follow @Like2Win and participate in bi-weekly $DEGEN raffles. Con 🎩 DEGEN: solo like. Sin 🎩: like + recast + comment. Zero friction, maximum rewards!",
      screenshotUrls: [`${URL}/screenshot.png`],
      iconUrl: `${URL}/icon.png`,
      imageUrl: `${URL}/hero.png`,
      heroImageUrl: `${URL}/hero.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#F59E0B",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: "social",
      tags: ["degen", "social", "rewards", "farcaster", "gamification", "raffles"],
      tagline: "Con 🎩 DEGEN: solo like. Sin 🎩: like + recast + comment",
      ogTitle: "Like2Win - Social Gamification Platform",
      ogDescription: "🎫 La forma más simple de ganar $DEGEN en Farcaster. Con 🎩 DEGEN: solo like. Sin 🎩: like + recast + comment. Sorteos bi-semanales.",
      ogImageUrl: `${URL}/hero.png`,
      buttonTitle: "Launch Like2Win",
    }),
  });
}
