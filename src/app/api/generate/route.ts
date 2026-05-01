import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyWatermark } from "@/lib/watermark";
import { getBriefs } from "@/lib/prompts";
import OpenAI from "openai";

const LOG = "[CoverPhoto:API]";
function apiLog(...args: any[]) { console.log(LOG, ...args); }
function apiError(...args: any[]) { console.error(LOG, "[ERROR]", ...args); }

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Models that accept reference images via responses.create
const IMAGE_MODELS = [
  "gpt-image-2",
  "chatgpt-image-latest",
  "gpt-4.1",
];

async function generateOne(briefId: string, prompt: string, images: string[]): Promise<string> {
  const refContent = images.slice(0, 3).map((img: string) => ({
    type: "input_image" as const,
    image_url: img,
  }));

  const input = [{
    role: "user" as const,
    content: [
      { type: "input_text" as const, text: prompt },
      ...refContent,
    ],
  }];

  let lastError: Error | null = null;

  for (const model of IMAGE_MODELS) {
    try {
      const resp = await (openai.responses as any).create({ model, input });
      const outputImage = (resp.output || [])
        .flatMap((o: any) => o.content || [])
        .find((c: any) => c.type === "output_image");
      if (outputImage?.image_base64) {
        apiLog(`  ${briefId}: ${model} ✓`);
        return outputImage.image_base64;
      }
      lastError = new Error("No image in output");
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("not found") || msg.includes("does not exist")) {
        apiLog(`  ${briefId}: ${model} ✗ (unavailable, trying next)`);
        lastError = e;
        continue;
      }
      throw e; // unexpected error, don't retry
    }
  }

  throw lastError || new Error("No available image model succeeded");
}

export async function POST(request: Request) {
  const reqId = Math.random().toString(36).slice(2, 8);
  apiLog(`[${reqId}] POST /api/generate`);

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    apiLog(`[${reqId}] Auth`, { email: session.user.email });

    const rateCheck = await checkRateLimit(session.user.email);
    if (!rateCheck.success) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    apiLog(`[${reqId}] Credits`, { credits: user.credits });

    const { images, count = 4, selectedTypes, customPrompts } = await request.json();
    apiLog(`[${reqId}] Request`, { images: images?.length, count, types: selectedTypes?.length });

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
    apiLog(`[${reqId}] Briefs`, { count: briefs.length, names: briefs.map((b) => b.id) });

    const results = await Promise.allSettled(
      briefs.map(async (brief) => {
        const effectivePrompt = customPrompts?.[brief.id] || brief.prompt;
        const start = Date.now();

        const b64 = await generateOne(brief.id, effectivePrompt, images);

        const elapsed = Date.now() - start;
        apiLog(`[${reqId}] Done ${brief.id}`, { elapsed: `${elapsed}ms` });

        const buffer = Buffer.from(b64, "base64");
        const watermarked = await applyWatermark(buffer, false);
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
      const reason = result.reason?.message || "Generation failed.";
      apiError(`[${reqId}] Portrait ${index} failed`, { error: reason.slice(0, 200) });
      return {
        id: `portrait-${index}`,
        style: briefs[index]?.id || "unknown",
        url: "",
        status: "error" as const,
        error: reason,
      };
    });

    const okCount = generatedPortraits.filter((p) => p.status === "completed").length;
    apiLog(`[${reqId}] Done`, { total: generatedPortraits.length, ok: okCount });

    if (okCount > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: creditCost } },
      });
      apiLog(`[${reqId}] Deducted`, { cost: creditCost });
    } else {
      apiLog(`[${reqId}] All failed — no deduction`);
    }

    const portraitSession = await prisma.portraitSessionRecord.create({
      data: {
        userId: user.id,
        images: JSON.stringify(images.map((i: string) => i.slice(0, 50))),
        portraits: JSON.stringify(generatedPortraits),
      },
    });

    return NextResponse.json({
      sessionId: portraitSession.id,
      portraits: generatedPortraits,
      creditsRemaining: okCount > 0 ? user.credits - creditCost : user.credits,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Generation failed";
    apiError(`[${reqId}] Catch`, { message: msg });
    console.error("Generation error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
