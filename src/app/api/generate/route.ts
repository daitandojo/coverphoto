import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyWatermark } from "@/lib/watermark";
import { getBriefs } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = await checkRateLimit(session.user.email);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded.", retryAfter: rateCheck.reset },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { images, count = 4, selectedTypes, customPrompts } = await request.json();

    if (!images || !Array.isArray(images) || images.length < 2) {
      return NextResponse.json({ error: "At least 2 reference images required" }, { status: 400 });
    }

    const promptEditEnabled = customPrompts && Object.keys(customPrompts).length > 0;
    const creditCost = count + (promptEditEnabled ? 2 : 0);

    if (user.credits < creditCost) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    const briefs = getBriefs(
      selectedTypes?.length > 0 ? selectedTypes : ["executive", "founder", "statesperson", "outdoors"]
    );
    briefs.length = Math.min(briefs.length, count);
    if (briefs.length === 0) {
      return NextResponse.json({ error: "No valid portrait types selected" }, { status: 400 });
    }

    // Deduct credits server-side
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: user.credits - creditCost },
    });

    // Create session record
    const portraitSession = await prisma.portraitSessionRecord.create({
      data: {
        userId: user.id,
        images: JSON.stringify(images),
        portraits: JSON.stringify([]),
      },
    });

    // Generate portraits using gpt-image-2
    const results = await Promise.allSettled(
      briefs.map(async (brief) => {
        const effectivePrompt = customPrompts?.[brief.id] || brief.prompt;

        const res = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-image-2",
            prompt: effectivePrompt,
            n: 1,
            size: "1024x1024",
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`OpenAI API error: ${err}`);
        }

        const data = await res.json();
        const b64 = data.data?.[0]?.b64_json;
        if (!b64) throw new Error("No image data in response");

        const buffer = Buffer.from(b64, "base64");
        const isPaid = false;
        const watermarked = await applyWatermark(buffer, isPaid);
        const finalB64 = watermarked.toString("base64");
        return { style: brief.id, url: `data:image/jpeg;base64,${finalB64}` };
      })
    );

    const generatedPortraits = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return {
          id: `portrait-${index}`,
          style: result.value.style,
          url: result.value.url,
          status: "completed" as const,
        };
      }
      return {
        id: `portrait-${index}`,
        style: briefs[index]?.id || "unknown",
        url: "",
        status: "error" as const,
        error: result.reason?.message || "Generation failed.",
      };
    });

    // Update session record
    await prisma.portraitSessionRecord.update({
      where: { id: portraitSession.id },
      data: { portraits: JSON.stringify(generatedPortraits) },
    });

    return NextResponse.json({
      sessionId: portraitSession.id,
      portraits: generatedPortraits,
      creditsRemaining: user.credits - creditCost,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
