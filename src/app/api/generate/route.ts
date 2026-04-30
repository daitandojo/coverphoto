import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyWatermark } from "@/lib/watermark";
import { getBriefs, getBrief } from "@/lib/prompts";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

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
    let briefs;
    if (selectedTypes && Array.isArray(selectedTypes) && selectedTypes.length > 0) {
      briefs = getBriefs(selectedTypes);
      if (briefs.length === 0) {
        briefs = getBriefs(["executive", "founder", "statesperson", "outdoors"]);
      }
    } else {
      briefs = getBriefs(["executive", "founder", "statesperson", "outdoors"]);
    }

    // Cap at the requested count
    briefs = briefs.slice(0, count);

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

    // Generate portraits
    const results = await Promise.allSettled(
      briefs.map(async (brief, index) => {
        const effectivePrompt = customPrompts?.[brief.id] || brief.prompt;

        const output = await replicate.run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          {
            input: {
              prompt: effectivePrompt,
              negative_prompt: "cartoon, anime, illustration, painting, distorted face, bad anatomy",
              width: 1024,
              height: 1024,
              num_outputs: 1,
              scheduler: "DPMSolverMultistep",
              num_inference_steps: 30,
              guidance_scale: 7,
              ip_adapter_image: images[0],
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
        const isPaid = false; // Check subscription in production
        const watermarked = await applyWatermark(buffer, isPaid);
        const b64 = watermarked.toString("base64");
        const dataUrl = `data:image/jpeg;base64,${b64}`;

        return { style: brief.id, url: dataUrl };
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
        error: "Generation failed. Please retry.",
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
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
