import { NextResponse } from "next/server";
import { auth, getUserCredits } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credits = await getUserCredits(session.user.email);

    return NextResponse.json({ credits });
  } catch {
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
  }
}
