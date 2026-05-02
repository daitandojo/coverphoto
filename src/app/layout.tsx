import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

const SITE_URL = "https://coverphoto.vercel.app";
const SITE_NAME = "CoverPhoto";
const DESCRIPTION =
  "CoverPhoto is a premium AI portrait studio that transforms your reference photos into professionally composed portraits. Choose from 12 portrait types, 8 specialties, and 18+ prompt constraints. Powered by gpt-image-2 via Replicate.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CoverPhoto — Premium AI Portrait Studio",
    template: "%s | CoverPhoto",
  },
  description: DESCRIPTION,
  keywords: [
    "AI portrait generator",
    "AI photo studio",
    "professional headshot AI",
    "AI photography",
    "portrait AI",
    "AI headshot generator",
    "photorealistic AI portraits",
    "AI wedding portraits",
    "AI passport photos",
    "AI LinkedIn headshot",
    "CoverPhoto",
  ],
  authors: [{ name: "CoverPhoto" }],
  creator: "CoverPhoto",
  publisher: "CoverPhoto",
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "CoverPhoto — Premium AI Portrait Studio",
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CoverPhoto AI Portrait Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@coverphoto",
    creator: "@coverphoto",
    title: "CoverPhoto — Premium AI Portrait Studio",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: { canonical: SITE_URL },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: SITE_NAME },
  other: { "mobile-web-app-capable": "yes" },
  verification: { google: "" }, // Add your Google Search Console verification code here
  category: "technology",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content="CoverPhoto" />
        <meta name="theme-color" content="#080808" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Preconnect to font providers */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Icons */}
        <link rel="apple-touch-icon" href="/icon-192.png" sizes="192x192" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "CoverPhoto",
              url: SITE_URL,
              description: DESCRIPTION,
              applicationCategory: "Multimedia",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free credits to start. Premium credit packages available.",
              },
              author: {
                "@type": "Organization",
                name: "CoverPhoto",
              },
            }),
          }}
        />

        {/* Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-[#080808] text-[#F0EDE8] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
