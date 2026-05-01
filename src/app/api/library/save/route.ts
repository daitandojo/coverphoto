import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portraits } = await request.json();

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Upsert a dedicated "library" session record
    const existing = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id, id: "library" },
    });

    if (existing) {
      await prisma.portraitSessionRecord.update({
        where: { id: "library" },
        data: { portraits: JSON.stringify(portraits || []) },
      });
    } else {
      await prisma.portraitSessionRecord.create({
        data: {
          id: "library",
          userId: user.id,
          images: "[]",
          portraits: JSON.stringify(portraits || []),
        },
      });
    }

    return NextResponse.json({ saved: true, count: portraits?.length || 0 });
  } catch (error) {
    console.error("Library save error:", error);
    return NextResponse.json({ error: "Failed to save library" }, { status: 500 });
  }
}
