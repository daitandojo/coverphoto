import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Find the most recent session for this user
    const latestSession = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    let portraits: any[] = [];
    let refImages: string[] = [];

    if (latestSession) {
      try { portraits = JSON.parse(latestSession.portraits || "[]"); } catch {}
      try { refImages = JSON.parse(latestSession.images || "[]"); } catch {}
    }

    return NextResponse.json({
      sessionId: latestSession?.id || null,
      portraits,
      refImages,
      credits: user.credits,
    });
  } catch (error) {
    console.error("Session load error:", error);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}
