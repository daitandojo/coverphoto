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

    // Only load the dedicated "library" record — transient generation sessions are not aggregated
    const libraryRecord = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id, id: "library" },
    });

    let portraits: any[] = [];
    if (libraryRecord) {
      try { portraits = JSON.parse(libraryRecord.portraits || "[]"); } catch {}
    }

    return NextResponse.json({
      portraits,
      credits: user.credits,
    });
  } catch (error) {
    console.error("Session load error:", error);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}
