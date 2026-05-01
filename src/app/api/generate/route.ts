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

    // Generate sequentially — Replicate free tier: 1 burst, 6/min
    const generatedPortraits: Array<{
      id: string; style: string; url: string; status: "completed" | "error"; error?: string;
    }> = [];

    for (let i = 0; i < briefs.length; i++) {
      const brief = briefs[i];
      const prompt = customPrompts?.[brief.id] || brief.prompt;
      const start = Date.now();

      try {
        const output = await replicate.run("openai/gpt-image-2", {
          input: {
            prompt,
            input_images: refUrls,
            aspect_ratio: "1:1",
            number_of_images: 1,
            openai_api_key: process.env.OPENAI_API_KEY,
          },
        });

        const elapsed = Date.now() - start;
        apiLog(`[${reqId}] Replicate ${brief.id}`, { elapsed: `${elapsed}ms`, out: JSON.stringify(output).slice(0, 200) });

        const imageUrl: string = Array.isArray(output) ? String(output[0] || "") : String(output || "");
        if (!imageUrl || !imageUrl.startsWith("http")) {
          throw new Error(`Bad output: ${JSON.stringify(output).slice(0, 150)}`);
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

        // If rate limited, wait before next request
        if (reason.includes("429") || reason.includes("throttled")) {
          const wait = 12_000;
          apiLog(`[${reqId}] Rate limited — waiting ${wait / 1000}s`);
          await new Promise((r) => setTimeout(r, wait));
        }
      }
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
