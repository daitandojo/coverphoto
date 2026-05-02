import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const sess = await auth();
    if (!sess?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: sess.user.email } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { uploadedImages, libraryPortraits, workbenchPortraits } = await request.json();

    const payload = JSON.stringify({
      uploadedImages: (uploadedImages || []).map((img: any) => ({
        id: img.id,
        preview: img.preview,
      })),
      libraryPortraits: libraryPortraits || [],
      workbenchPortraits: workbenchPortraits || [],
    });

    const existing = await prisma.portraitSessionRecord.findFirst({
      where: { userId: user.id, id: "state" },
    });

    if (existing) {
      await prisma.portraitSessionRecord.update({
        where: { id: "state" },
        data: { portraits: payload },
      });
    } else {
      await prisma.portraitSessionRecord.create({
        data: { id: "state", userId: user.id, images: "[]", portraits: payload },
      });
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("State save error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
