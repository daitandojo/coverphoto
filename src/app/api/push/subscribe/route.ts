import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint, keys } = await request.json();

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Store the subscription — add a pushSubscription field would need schema change
    // For now, store in a dedicated session record
    const subRecord = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id, id: "push-sub" },
    });

    const data = JSON.stringify({ endpoint, keys });

    if (subRecord) {
      await prisma.portraitSessionRecord.update({
        where: { id: "push-sub" },
        data: { portraits: data },
      });
    } else {
      await prisma.portraitSessionRecord.create({
        data: { id: "push-sub", userId: user.id, images: "[]", portraits: data },
      });
    }

    return NextResponse.json({ subscribed: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
