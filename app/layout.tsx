import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { fonts } from "@/lib/fonts";
import { Header } from "./components/header";
import { BottomAppBar } from "./components/bottom-app-bar";
import { ErrorSuppressor } from "./components/ErrorSuppressor";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL || "https://like2win-app.vercel.app";
  const PROJECT_NAME = "Like2Win";
  
  // Like2Win Mini App embed metadata for social sharing
  const miniAppEmbed = {
    version: "1",
    imageUrl: `${URL}/hero.png?v=${Date.now()}`,
    button: {
      title: "🎫 Play & Win $DEGEN",
      action: {
        type: "launch_miniapp",
        name: "Like2Win",
        url: `${URL}/miniapp`,
        splashImageUrl: `${URL}/splash.png`,
        splashBackgroundColor: "#F59E0B"
      },
    },
  };
  
  return {
    title: `${PROJECT_NAME} - Follow + Like = Win $DEGEN`,
    description:
      "🎫 Like2Win: La forma más simple de ganar $DEGEN en Farcaster. Follow @Like2Win y participa según tu tipo: Con 🎩 DEGEN: solo like, Sin 🎩: like + recast + comment. Sorteos diarios automáticos. Zero friction, maximum fun!",
    keywords: [
      "Farcaster",
      "DEGEN", 
      "Like2Win",
      "Social rewards",
      "Crypto raffles",
      "Web3 gamification",
      "Base blockchain",
      "MiniKit"
    ],
    authors: [{ name: "Like2Win Team" }],
    creator: "Like2Win",
    openGraph: {
      title: `${PROJECT_NAME} - Follow + Like = Win $DEGEN`,
      description: "🎫 La forma más simple de ganar $DEGEN en Farcaster. Sorteos diarios automáticos. Con 🎩 DEGEN: solo like, Sin 🎩: like + recast + comment",
      url: URL,
      siteName: PROJECT_NAME,
      images: [
        {
          url: `${URL}/hero.png`,
          width: 1200,
          height: 630,
          alt: "Like2Win - Social Rewards on Farcaster"
        }
      ],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${PROJECT_NAME} - Follow + Like = Win $DEGEN`,
      description: "🎫 La forma más simple de ganar $DEGEN en Farcaster. Sorteos diarios automáticos. Con 🎩 DEGEN: solo like, Sin 🎩: like + recast + comment",
      images: [`${URL}/hero.png`],
      creator: "@Like2Win"
    },
    other: {
      // Mini App embed metadata (required for Farcaster)
      "fc:miniapp": JSON.stringify(miniAppEmbed),
      // For backward compatibility with older Farcaster clients
      "fc:frame": JSON.stringify({
        ...miniAppEmbed,
        button: {
          ...miniAppEmbed.button,
          action: {
            ...miniAppEmbed.button.action,
            type: "launch_frame" // backward compatibility
          }
        }
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script 
          src="https://minikit.farcaster.com/minikit.js" 
          async
          defer
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('message', function(event) {
                if (event.data?.type === 'FARCASTER_FRAME_READY') {
                  console.log('Farcaster frame ready message received');
                }
              });
            `
          }}
        />
      </head>
      <body 
        className={`bg-background ${fonts.funnelDisplay.variable} ${fonts.ledger.variable} ${fonts.raleway.variable} ${fonts.spaceGrotesk.variable}`}
      >
        <Providers>
          <ErrorSuppressor />
          <Header />
          <main>{children}</main>
          <BottomAppBar />
        </Providers>
      </body>
    </html>
  );
}
