import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "CoverPhoto — Premium AI Portraits",
  description:
    "World-class AI portrait generation. Upload your reference images and receive four professionally composed portraits in studio quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#080808] text-[#F0EDE8] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
