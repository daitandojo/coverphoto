import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyWatermark } from "@/lib/watermark";
import { getBriefs, randomizePrompt } from "@/lib/prompts";
import { getSpecialty } from "@/lib/specialties";
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

    const { images, typeCounters, customPrompts, specialConfigs, specialFields, constraints } = await request.json();
    if (!images?.length || images.length < 2) {
      return NextResponse.json({ error: "At least 2 reference images required" }, { status: 400 });
    }

    // Expand standard types
    const orderedTypes = Object.entries(typeCounters || {}).flatMap(([type, cnt]) => Array(cnt as number).fill(type));

    // Expand specialties
    const orderedSpecials: { id: string; config: Record<string, string> }[] = [];
    if (specialConfigs) {
      Object.entries(specialConfigs).forEach(([sid, cnt]) => {
        for (let i = 0; i < (cnt as number); i++) {
          orderedSpecials.push({ id: sid, config: specialFields?.[sid] || {} });
        }
      });
    }

    const total = orderedTypes.length + orderedSpecials.length;
    if (total === 0) return NextResponse.json({ error: "No portrait types selected" }, { status: 400 });

    const promptEditEnabled = customPrompts && Object.keys(customPrompts).length > 0;

    // Calculate credit cost: standard types = 1 each, specialties use their own cost
    const specCost = orderedSpecials.reduce((sum, s) => {
      const spec = getSpecialty(s.id);
      return sum + (spec ? spec.cost : 4);
    }, 0);
    const creditCost = orderedTypes.length + specCost + (promptEditEnabled ? 2 : 0);
    if (user.credits < creditCost) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    const briefs = getBriefs(orderedTypes);
    function applyConstraints(p: string): string {
      const c = constraints || {};
      let r = p;
      if (c.lookAtCamera) r += "\n\nCONSTRAINT: The subject must look directly into the camera lens. Direct eye contact.";
      if (c.bright) r += "\n\nCONSTRAINT: Bright, well-lit environment. High-key lighting. No dark shadows. The scene should be brightly illuminated.";
      if (c.winking) r += "\n\nCONSTRAINT: The subject must be winking with one eye. One eye closed, the other open. A playful wink.";
      if (c.naked) r += "\n\nCONSTRAINT: Full body shot. The entire person is visible from head to toe. Full height portrait showing the complete figure. Not just a headshot or bust.";
      if (c.smiling) r += "\n\nCONSTRAINT: The subject has a warm, genuine smile. Happy expression. Teeth visible or closed-mouth smile. Friendly and approachable.";
      if (c.flirty) r += "\n\nCONSTRAINT: Playful, flirtatious expression. Slight smirk, head tilted. Mischievous glint in the eyes. Confident and coy.";
      if (c.serious) r += "\n\nCONSTRAINT: Serious, stern expression. No smile. Neutral or intense gaze. Composed, professional, no-nonsense demeanor.";
      if (c.lookingAway) r += "\n\nCONSTRAINT: The subject is looking away from the camera. Gaze directed off-camera, into the distance. Candid, contemplative mood.";
      if (c.dramatic) r += "\n\nCONSTRAINT: Dramatic, low-key lighting setup. Deep shadows, high contrast. Single strong key light. Cinematic, moody atmosphere. Chiaroscuro effect.";
      if (c.vintage) r += "\n\nCONSTRAINT: Vintage aesthetic. Warm sepia or desaturated tones. Classic retro styling. Film grain texture. Timeless, old-school photography look.";
      if (c.friendly) r += "\n\nCONSTRAINT: Warm, friendly, approachable expression. Open body language. A welcoming, kind smile. The subject looks like a trusted friend.";
      if (c.tanned) r += "\n\nCONSTRAINT: Sun-kissed, tanned skin tone. Warm bronze glow. Healthy, outdoor complexion. Sunkissed look.";
      if (c.makeUp) r += "\n\nCONSTRAINT: Full professional makeup. Bold lipstick, defined eyes, flawless complexion. Glamorous, editorial makeup style.";
if (c.onHoliday) r += "\n\nCONSTRAINT: Holiday or vacation setting. Relaxed, casual, carefree vibe. Natural sunlight, warm atmosphere. Leisurely attire.";
if (c.blackWhite) r += "\n\nCONSTRAINT: Black and white monochrome. No colour. Classic black and white photography. Silver gelatin print aesthetic. High contrast monochrome.";
return r;
    }

    const allBriefs: { id: string; prompt: string }[] = [
      ...briefs.map((b) => ({ id: b.id, prompt: applyConstraints(customPrompts?.[b.id] ? customPrompts[b.id] : randomizePrompt(b.id, b.prompt)) })),
      ...orderedSpecials.map((s) => {
        const spec = getSpecialty(s.id);
        return { id: s.id, prompt: spec ? spec.generatePrompt(s.config) : `Portrait: ${s.id}` };
      }),
    ];
    if (!allBriefs.length) return NextResponse.json({ error: "No valid portrait types" }, { status: 400 });

    const email = session.user!.email!;
    const refUrls = await Promise.all(images.slice(0, 3).map((img: string, i: number) => uploadRef(img, email, i)));
    apiLog(`[${reqId}] Refs uploaded`, { count: refUrls.length });

    // Generate with concurrency limit of 2 (avoids Replicate rate limits)
    const CONCURRENCY = 1;
    const generatedPortraits: Array<{
      id: string; style: string; url: string; status: "completed" | "error"; error?: string;
    }> = [];

    async function generateOne(brief: (typeof allBriefs)[0], i: number) {
      const prompt = brief.prompt;
      const start = Date.now();

      try {
        // Create prediction, then poll manually to see full response
        const prediction = await replicate.predictions.create({
          model: "openai/gpt-image-2",
          input: {
            prompt,
            input_images: refUrls,
            aspect_ratio: "1:1",
            number_of_images: 1,
            output_format: "png",
          },
        });

        // Poll until complete
        let final = await replicate.wait(prediction);

        const elapsed = Date.now() - start;
        apiLog(`[${reqId}] Replicate ${brief.id}`, {
          elapsed: `${elapsed}ms`,
          status: final.status,
          outputType: typeof final.output,
          outputStr: JSON.stringify(final.output).slice(0, 300),
          outputKeys: final.output && typeof final.output === "object" ? Object.keys(final.output) : [],
        });

        if (final.status === "failed") {
          throw new Error(`Prediction failed: ${final.error}`);
        }

        let imageUrl = "";

        // Try prediction.output directly
        if (typeof final.output === "string") {
          imageUrl = final.output;
        } else if (Array.isArray(final.output)) {
          const f = final.output[0];
          if (typeof f === "string") imageUrl = f;
          else if (f && typeof f === "object") {
            const o = f as Record<string, unknown>;
            imageUrl = String(o.image || o.url || o.image_url || o.output || "");
          }
        } else if (final.output && typeof final.output === "object") {
          const o = final.output as Record<string, unknown>;
          imageUrl = String(o.image || o.url || o.image_url || o.output || "");
        }

        // Also check if there's a file output URL in the prediction metadata
        if (!imageUrl && (final as any).files) {
          const files = (final as any).files;
          if (Array.isArray(files) && files.length > 0) {
            imageUrl = String(files[0].url || files[0]);
          }
        }

        if (!imageUrl || !imageUrl.startsWith("http")) {
          throw new Error(`No URL found. Output: ${JSON.stringify(final.output).slice(0, 200)}`);
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
    const queue = allBriefs.map((b, i) => ({ brief: b, index: i }));
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
