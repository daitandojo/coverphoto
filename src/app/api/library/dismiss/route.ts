import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "No portrait ID" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Load existing dismissed list from user metadata or dedicated record
    let dismissedRec = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id, id: "dismissed" },
    });

    const dismissed: string[] = dismissedRec ? JSON.parse(dismissedRec.portraits || "[]") : [];

    if (!dismissed.includes(id)) {
      dismissed.push(id);
    }

    if (dismissedRec) {
      await prisma.portraitSessionRecord.update({
        where: { id: "dismissed" },
        data: { portraits: JSON.stringify(dismissed) },
      });
    } else {
      await prisma.portraitSessionRecord.create({
        data: { id: "dismissed", userId: user.id, images: "[]", portraits: JSON.stringify(dismissed) },
      });
    }

    return NextResponse.json({ dismissed: true });
  } catch (error) {
    console.error("Dismiss error:", error);
    return NextResponse.json({ error: "Failed to dismiss" }, { status: 500 });
  }
}
