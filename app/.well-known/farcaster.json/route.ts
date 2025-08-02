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
      payload: process.env.FARCASTER_PAYLOAD || "eyJkb21haW4iOiJraXdpay1haS52ZXJjZWwuYXBwIn0",
      signature: process.env.FARCASTER_SIGNATURE || "MHg3NzA1MzUxOGUxNzVhZjYxMzEyZjRhNDdiZGU3YWRmNmFhZmE4NGE2YjI5ZDEyOGI5YjAyZmY5ZjBiODIwYTgwNjAyZWNhNWQ0MTA1ZjBjM2NlZWI4ZjBiZWZjZTM3ZGVjZjlkYTlmODUwOTQxNzVhZDY4OGVhM2Y2MzJiNzE0MDFi",
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Like2Win",
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE || "talent launchpad",
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "talent launchpad",
      screenshotUrls: process.env.NEXT_PUBLIC_APP_SCREENSHOT_URLS?.split(',') || [`${URL}/screenshot.png`],
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON || `${URL}/icon.png`,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${URL}/hero.png`,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#000000",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "social",
      tags: [],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/image.png`,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Incubadora de talento",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "Like2Win - Social Gamification Platform",
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
      buttonTitle: "Iniciar",
      imageUrl: `${URL}/image.png`,
    }),
  });
}
