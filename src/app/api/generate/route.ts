import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyWatermark } from "@/lib/watermark";
import { getBriefs } from "@/lib/prompts";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

async function uploadImage(
  base64: string,
  email: string,
  index: number
): Promise<string> {
  // Try Vercel Blob first
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const buffer = Buffer.from(base64.split(",")[1] || base64, "base64");
      const { url } = await put(
        `references/${email}/${Date.now()}-${index}.jpg`,
        buffer,
        { contentType: "image/jpeg" }
      );
      return url;
    } catch (e) {
      console.warn("Vercel Blob upload failed, falling back to data URL:", e);
    }
  }
  // Fallback: return the base64 data URL — Replicate may or may not support this
  return base64;
}

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

    // Determine which briefs to use
    const briefs = getBriefs(
      selectedTypes?.length > 0 ? selectedTypes : ["executive", "founder", "statesperson", "outdoors"]
    );
    briefs.length = Math.min(briefs.length, count);
    if (briefs.length === 0) {
      return NextResponse.json({ error: "No valid portrait types selected" }, { status: 400 });
    }

    // Upload reference images to accessible URLs
    const userEmail = session.user!.email!;
    const uploadedUrls = await Promise.all(
      images.map((img: string, i: number) => uploadImage(img, userEmail, i))
    );

    // Deduct credits server-side
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: user.credits - creditCost },
    });

    // Create session record
    const portraitSession = await prisma.portraitSessionRecord.create({
      data: {
        userId: user.id,
        images: JSON.stringify(uploadedUrls),
        portraits: JSON.stringify([]),
      },
    });

    // Generate portraits in parallel
    const results = await Promise.allSettled(
      briefs.map(async (brief) => {
        const effectivePrompt = customPrompts?.[brief.id] || brief.prompt;

        const output = await replicate.run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          {
            input: {
              prompt: effectivePrompt,
              negative_prompt:
                "cartoon, anime, illustration, painting, distorted face, bad anatomy",
              width: 1024,
              height: 1024,
              num_outputs: 1,
              scheduler: "DPMSolverMultistep",
              num_inference_steps: 30,
              guidance_scale: 7,
              ip_adapter_image: uploadedUrls[0],
              ip_adapter_scale: 0.6,
            },
          }
        );

        const imageUrl = Array.isArray(output) ? output[0] : output;
        if (!imageUrl || typeof imageUrl !== "string") {
          throw new Error("No image generated");
        }

        const response = await fetch(imageUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        const isPaid = false;
        const watermarked = await applyWatermark(buffer, isPaid);
        const b64 = watermarked.toString("base64");
        return { style: brief.id, url: `data:image/jpeg;base64,${b64}` };
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
        error: result.reason?.message || "Generation failed. Please retry.",
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
