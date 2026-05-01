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

    // Find the library record and remove the portrait
    const libraryRecord = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id, id: "library" },
    });

    if (libraryRecord) {
      const portraits = JSON.parse(libraryRecord.portraits || "[]");
      const filtered = portraits.filter((p: any) => p && p.id !== id);
      await prisma.portraitSessionRecord.update({
        where: { id: "library" },
        data: { portraits: JSON.stringify(filtered) },
      });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Library delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
