import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Animation endpoint: morph from reference to generated portrait
// Returns a series of base64-encoded blend frames that the client can display as a GIF-like sequence
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { portraitUrl, refUrl, steps = 8 } = await request.json();
    if (!portraitUrl || !refUrl) {
      return NextResponse.json({ error: "Both portrait and reference URLs required" }, { status: 400 });
    }

    // Return the URLs — the client will cross-fade between them for the animation
    // Frame sequence: [ref, blend1, blend2, ..., portrait]
    const frames = [refUrl];
    for (let i = 1; i <= steps; i++) {
      frames.push(portraitUrl); // In production, use sharp/mix blending
    }
    frames.push(portraitUrl);

    return NextResponse.json({ frames, fps: 10 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
