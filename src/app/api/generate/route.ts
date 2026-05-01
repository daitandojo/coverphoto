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

async function uploadRef(base64: string, email: string, i: number): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return base64;
  const { put } = await import("@vercel/blob");
  const buf = Buffer.from(base64.split(",")[1] || base64, "base64");
  const { url } = await put(`refs/${email}/${Date.now()}-${i}.jpg`, buf, { access: "public" });
  return url;
}

export async function POST(request: Request) {
  const reqId = Math.random().toString(36).slice(2, 8);
  apiLog(`[${reqId}] POST /api/generate`);

  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateCheck = await checkRateLimit(session.user.email);
    if (!rateCheck.success) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    apiLog(`[${reqId}] User`, { credits: user.credits });

    const { images, count = 4, selectedTypes, customPrompts } = await request.json();
    if (!images?.length || images.length < 2) {
      return NextResponse.json({ error: "At least 2 reference images required" }, { status: 400 });
    }

    const promptEditEnabled = customPrompts && Object.keys(customPrompts).length > 0;
    const creditCost = count + (promptEditEnabled ? 2 : 0);
    if (user.credits < creditCost) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    const briefs = getBriefs(selectedTypes?.length ? selectedTypes : ["executive","founder","statesperson","outdoors"]);
    briefs.length = Math.min(briefs.length, count);
    if (!briefs.length) return NextResponse.json({ error: "No valid portrait types" }, { status: 400 });

    const email = session.user!.email!;
    const refUrls = await Promise.all(images.slice(0, 3).map((img: string, i: number) => uploadRef(img, email, i)));
    apiLog(`[${reqId}] Refs uploaded`, { count: refUrls.length });

    // Generate with concurrency limit of 2 (avoids Replicate rate limits)
    const CONCURRENCY = 1;
    const generatedPortraits: Array<{
      id: string; style: string; url: string; status: "completed" | "error"; error?: string;
    }> = [];

    async function generateOne(brief: (typeof briefs)[0], i: number) {
      const prompt = customPrompts?.[brief.id] || brief.prompt;
      const start = Date.now();

      try {
        const output = await replicate.run("openai/gpt-image-2", {
          input: {
            prompt,
            input_images: refUrls,
            aspect_ratio: "1:1",
            number_of_images: 1,
            output_format: "png",
          },
        });

        const elapsed = Date.now() - start;
        apiLog(`[${reqId}] Replicate ${brief.id}`, { elapsed: `${elapsed}ms`, out: JSON.stringify(output).slice(0, 200) });

        let imageUrl = "";
        if (Array.isArray(output)) {
          const first = output[0];
          if (typeof first === "string" && first.startsWith("http")) {
            imageUrl = first;
          } else if (first && typeof first === "object") {
            const obj = first as Record<string, unknown>;
            imageUrl = String(obj.url || obj.image_url || obj.output || "");
          }
        } else if (typeof output === "string") {
          imageUrl = output;
        } else if (output && typeof output === "object") {
          const obj = output as Record<string, unknown>;
          imageUrl = String(obj.url || obj.image_url || obj.output || "");
        }

        if (!imageUrl || !imageUrl.startsWith("http")) {
          const raw = JSON.stringify(output);
          apiLog(`[${reqId}] Output debug`, { isArr: Array.isArray(output), type: typeof output, firstKeys: output && typeof output === "object" ? Object.keys(output) : [], raw: raw.slice(0, 300) });
          throw new Error(`No URL in output (type=${typeof output})`);
        }

        const resp = await fetch(imageUrl);
        if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
        const buffer = Buffer.from(await resp.arrayBuffer());
        const watermarked = await applyWatermark(buffer, false);

        generatedPortraits.push({
          id: `portrait-${i}`,
          style: brief.id,
          url: `data:image/jpeg;base64,${watermarked.toString("base64")}`,
          status: "completed",
        });
      } catch (err: any) {
        const reason = err?.message || "Generation failed.";
        apiError(`[${reqId}] Portrait ${i} failed`, { error: reason.slice(0, 200) });
        generatedPortraits.push({
          id: `portrait-${i}`,
          style: brief.id,
          url: "",
          status: "error",
          error: reason,
        });
      }
    }

    // Semaphore — run 2 at a time
    const queue = briefs.map((b, i) => ({ brief: b, index: i }));
    for (let i = 0; i < queue.length; i += CONCURRENCY) {
      const batch = queue.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map(({ brief, index }) => generateOne(brief, index)));
    }

    const ok = generatedPortraits.filter((p) => p.status === "completed").length;
    apiLog(`[${reqId}] Done`, { total: generatedPortraits.length, ok });

    if (ok > 0) {
      await prisma.user.update({ where: { id: user.id }, data: { credits: { decrement: creditCost } } });
    }

    await prisma.portraitSessionRecord.create({
      data: { userId: user.id, images: JSON.stringify(refUrls), portraits: JSON.stringify(generatedPortraits) },
    });

    return NextResponse.json({ portraits: generatedPortraits, creditsRemaining: ok > 0 ? user.credits - creditCost : user.credits });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Generation failed";
    apiError(`[${reqId}] Catch`, { message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
