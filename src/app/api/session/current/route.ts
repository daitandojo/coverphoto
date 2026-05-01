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

    // Aggregate ALL session portraits into one library
    const allSessions = await prisma.portraitSessionRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Collect all portraits from all sessions, deduplicate by id
    const seen = new Set<string>();
    const allPortraits: any[] = [];
    for (const s of allSessions) {
      try {
        const portraits = JSON.parse(s.portraits || "[]");
        for (const p of portraits) {
          if (p && !seen.has(p.id)) {
            seen.add(p.id);
            allPortraits.push(p);
          }
        }
      } catch {}
    }

    // Also load the library field if it exists (from save-library endpoint)
    let libraryPortraits: any[] = [];
    const librarySession = allSessions.find((s) => s.id === "library");
    if (librarySession) {
      try { libraryPortraits = JSON.parse(librarySession.portraits || "[]"); } catch {}
    }

    // Merge: library takes precedence (it has the user's curated set)
    const merged = libraryPortraits.length > 0 ? libraryPortraits : allPortraits;

    return NextResponse.json({
      sessionId: allSessions[0]?.id || null,
      portraits: merged,
      credits: user.credits,
    });
  } catch (error) {
    console.error("Session load error:", error);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}
