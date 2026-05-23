import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sess = await auth();
    if (!sess?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: sess.user.email } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Load state (includes uploadedImages previews, library, and workbench)
    const stateRec = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id, id: "state" },
    });

    let savedState: { uploadedImages?: any[]; libraryPortraits?: any[]; workbenchPortraits?: any[] } = {};
    if (stateRec) {
      try { savedState = JSON.parse(stateRec.portraits || "{}"); } catch {}
    }

    // Load dismissed IDs
    const dismissedRec = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id, id: "dismissed" },
    });
    const dismissed: string[] = dismissedRec ? JSON.parse(dismissedRec.portraits || "[]") : [];

    // Aggregate all generation sessions for auto-restore of completed portraits
    const allSessions = await prisma.portraitSessionRecord.findMany({
      where: { userId: user.id, id: { notIn: ["library", "dismissed", "state"] } },
      orderBy: { createdAt: "desc" },
    });

    const seen = new Set<string>();
    const allPortraits: any[] = [];

    // 1. State's library/workbench portraits first
    for (const p of savedState.libraryPortraits || []) {
      if (p && !seen.has(p.id) && !dismissed.includes(p.id)) { seen.add(p.id); allPortraits.push(p); }
    }
    for (const p of savedState.workbenchPortraits || []) {
      if (p && !seen.has(p.id) && !dismissed.includes(p.id)) { seen.add(p.id); allPortraits.push(p); }
    }

    // 2. Generation session portraits (completed, not dismissed)
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

    return NextResponse.json({
      portraits: allPortraits,
      uploadedImages: savedState.uploadedImages || [],
      credits: user.credits,
    });
  } catch (error) {
    console.error("Session load error:", error);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}
