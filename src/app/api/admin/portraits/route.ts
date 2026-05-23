import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "reconozco@gmail.com";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all generation session records (exclude special records)
    const records = await prisma.portraitSessionRecord.findMany({
      where: { id: { notIn: ["library", "dismissed", "state"] } },
      orderBy: { createdAt: "desc" },
    });

    // Get all users to map email addresses
    const allUsers = await prisma.user.findMany();
    const userMap = new Map(allUsers.map((u) => [u.id, u.email || "unknown"]));

    // Collect all portraits with their owners
    const allPortraits: { id: string; url: string; style: string; ownerEmail: string; createdAt: string }[] = [];
    const seen = new Set<string>();

    for (const rec of records) {
      try {
        const portraits = JSON.parse(rec.portraits || "[]");
        const ownerEmail = userMap.get(rec.userId) || "unknown";
        for (const p of portraits) {
          if (p && p.url && (p.url.startsWith("http") || p.url.startsWith("data:")) && !seen.has(p.id)) {
            seen.add(p.id);
            allPortraits.push({
              id: p.id,
              url: p.url,
              style: p.style || "unknown",
              ownerEmail: ownerEmail === ADMIN_EMAIL ? "" : ownerEmail,
              createdAt: rec.createdAt.toISOString(),
            });
          }
        }
      } catch {}
    }

    return NextResponse.json({ portraits: allPortraits });
  } catch (error) {
    console.error("Admin portraits error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
