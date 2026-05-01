import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyWatermark } from "@/lib/watermark";
import { getBriefs } from "@/lib/prompts";
import Replicate from "replicate";

const LOG = "[CoverPhoto:API]";
function apiLog(...args: any[]) { console.log(LOG, ...args); }
function apiError(...args: any[]) { console.error(LOG, "[ERROR]", ...args); }

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

async function uploadToBlob(
  base64: string,
  email: string,
  index: number
): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return base64; // fallback
  }
  const { put } = await import("@vercel/blob");
  const buffer = Buffer.from(base64.split(",")[1] || base64, "base64");
  const { url } = await put(
    `references/${email}/${Date.now()}-${index}.jpg`,
    buffer,
    { access: "public" }
  );
  return url;
}

export async function POST(request: Request) {
  const reqId = Math.random().toString(36).slice(2, 8);
  apiLog(`[${reqId}] POST /api/generate start`);

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    apiLog(`[${reqId}] Auth OK`, { email: session.user.email });

    const rateCheck = await checkRateLimit(session.user.email);
    if (!rateCheck.success) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    apiLog(`[${reqId}] User`, { credits: user.credits });

    const { images, count = 4, selectedTypes, customPrompts } = await request.json();
    apiLog(`[${reqId}] Body`, { images: images?.length, count, types: selectedTypes?.length });

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

    await prisma.user.update({
      where: { id: user.id },
      data: { credits: user.credits - creditCost },
    });
    apiLog(`[${reqId}] Credits deducted`, { cost: creditCost, remaining: user.credits - creditCost });

    const portraitSession = await prisma.portraitSessionRecord.create({
      data: { userId: user.id, images: JSON.stringify(images), portraits: JSON.stringify([]) },
    });
    apiLog(`[${reqId}] Session`, { id: portraitSession.id });

    // Upload reference images to Vercel Blob for public URLs
    const userEmail = session.user!.email!;
    const refUrls = await Promise.all(
      images.map((img: string, i: number) => uploadToBlob(img, userEmail, i))
    );
    apiLog(`[${reqId}] Ref URLs`, { count: refUrls.length, first: refUrls[0].slice(0, 60) });

    // Generate portraits in parallel via Replicate openai/gpt-image-2
    const results = await Promise.allSettled(
      briefs.map(async (brief, idx) => {
        const effectivePrompt = customPrompts?.[brief.id] || brief.prompt;
        apiLog(`[${reqId}] Brief ${idx}`, { style: brief.id, promptLen: effectivePrompt.length });

        const start = Date.now();
        const output = await replicate.run("openai/gpt-image-2", {
          input: {
            prompt: effectivePrompt,
            image: refUrls[0],
            size: "1024x1024",
          },
        });
        const elapsed = Date.now() - start;
        apiLog(`[${reqId}] Replicate done ${brief.id}`, { elapsed: `${elapsed}ms`, outputType: typeof output, outputStr: JSON.stringify(output).slice(0, 300) });

        // Parse the output - Replicate image models return varying formats
        let imageUrl: string;
        if (Array.isArray(output)) {
          const first = output[0];
          if (typeof first === "string") {
            imageUrl = first;
          } else if (typeof first === "object" && first !== null) {
            const obj = first as Record<string, unknown>;
            imageUrl = (obj.url || obj.image_url || obj.output || "") as string;
          } else {
            throw new Error(`Unexpected array element: ${JSON.stringify(first).slice(0, 100)}`);
          }
        } else if (typeof output === "string") {
          imageUrl = output;
        } else if (typeof output === "object" && output !== null) {
          const obj = output as Record<string, unknown>;
          imageUrl = (obj.url || obj.image_url || obj.output || "") as string;
        } else {
          throw new Error(`Unexpected output: ${JSON.stringify(output).slice(0, 200)}`);
        }

        if (!imageUrl || typeof imageUrl !== "string") {
          throw new Error(`Unexpected output: ${JSON.stringify(output).slice(0, 100)}`);
        }

        const resp = await fetch(imageUrl);
        if (!resp.ok) throw new Error(`Failed to fetch generated image: ${resp.status}`);
        const buffer = Buffer.from(await resp.arrayBuffer());
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
    const msg = error instanceof Error ? error.message : "Generation failed";
    apiError(`[${reqId}] Catch`, { message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
