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

    // Load dismissed IDs
    const dismissedRec = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id, id: "dismissed" },
    });
    const dismissed: string[] = dismissedRec ? JSON.parse(dismissedRec.portraits || "[]") : [];

    // Load library (explicitly saved portraits)
    const libraryRec = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id, id: "library" },
    });
    let libraryPortraits: any[] = [];
    if (libraryRec) {
      try { libraryPortraits = JSON.parse(libraryRec.portraits || "[]"); } catch {}
    }

    // Aggregate all generation sessions as well (for auto-restore)
    const allSessions = await prisma.portraitSessionRecord.findMany({
      where: { userId: user.id, id: { notIn: ["library", "dismissed"] } },
      orderBy: { createdAt: "desc" },
    });

    const seen = new Set<string>();
    const allPortraits: any[] = [];

    // Library items come first (authoritative)
    for (const p of libraryPortraits) {
      if (p && !seen.has(p.id) && !dismissed.includes(p.id)) {
        seen.add(p.id);
        allPortraits.push(p);
      }
    }

    // Then aggregate from all generation sessions (skip dismissed ones)
    for (const s of allSessions) {
      try {
        const portraits = JSON.parse(s.portraits || "[]");
        for (const p of portraits) {
          if (p && !seen.has(p.id) && !dismissed.includes(p.id)) {
            seen.add(p.id);
            allPortraits.push(p);
          }
        }
      } catch {}
    }

    return NextResponse.json({ portraits: allPortraits, credits: user.credits });
  } catch (error) {
    console.error("Session load error:", error);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}
