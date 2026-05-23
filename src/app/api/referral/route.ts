import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: "Missing referral code" }, { status: 400 });

    const referrer = await prisma.user.findUnique({ where: { id: code } });
    if (!referrer) return NextResponse.json({ error: "Invalid referral" }, { status: 404 });

    // Mark this session as referred (the actual credit grant happens on sign-up)
    return NextResponse.json({ valid: true, referrerName: referrer.name || "someone" });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
