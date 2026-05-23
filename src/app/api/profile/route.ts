import { NextResponse } from "next/server";
import { auth, getUserCredits } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const credits = await getUserCredits(session.user.email);

    return NextResponse.json({
      name: user.name || session.user.email.split("@")[0],
      image: user.image || null,
      credits,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
