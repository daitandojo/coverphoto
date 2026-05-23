import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // For now, return a local object URL
    // In production, upload to Vercel Blob or Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const url = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url, filename: file.name });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
