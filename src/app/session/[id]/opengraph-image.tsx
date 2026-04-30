import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

interface OGProps {
  params: Promise<{ id: string }>;
}

export default async function OGImage({ params }: OGProps) {
  const { id } = await params;

  let subtitle = "Made with PortraitStudio";

  try {
    const session = await prisma.portraitSessionRecord.findUnique({
      where: { id },
    });
    if (session) {
      subtitle = "Premium AI Portrait Generation";
    }
  } catch {
    // Fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#080808",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(200,185,154,0.4), rgba(200,185,154,0.6), rgba(200,185,154,0.4), transparent)",
          }}
        />
        <h1
          style={{
            fontSize: 72,
            letterSpacing: "0.15em",
            color: "#F0EDE8",
            margin: 0,
            fontWeight: 500,
          }}
        >
          Portrait Session
        </h1>
        <div
          style={{
            width: 80,
            height: 1,
            background: "rgba(200,185,154,0.4)",
            margin: "24px 0",
          }}
        />
        <p
          style={{
            fontSize: 20,
            letterSpacing: "0.3em",
            color: "rgba(200,185,154,0.6)",
            textTransform: "uppercase",
            fontFamily: "monospace",
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      </div>
    ),
    { ...size }
  );
}
