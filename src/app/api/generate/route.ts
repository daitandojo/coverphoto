import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyWatermark } from "@/lib/watermark";
import { getBriefs } from "@/lib/prompts";

const LOG = "[CoverPhoto:API]";
function apiLog(...args: any[]) { console.log(LOG, ...args); }
function apiError(...args: any[]) { console.error(LOG, "[ERROR]", ...args); }

function base64ToBlob(base64: string): Blob {
  const raw = base64.split(",")[1] || base64;
  const buf = Buffer.from(raw, "base64");
  return new Blob([buf], { type: "image/png" });
}

export async function POST(request: Request) {
  const reqId = Math.random().toString(36).slice(2, 8);
  apiLog(`[${reqId}] POST /api/generate start`);

  try {
    const session = await auth();
    if (!session?.user?.email) {
      apiLog(`[${reqId}] Unauthorized`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    apiLog(`[${reqId}] Auth OK`, { email: session.user.email });

    const rateCheck = await checkRateLimit(session.user.email);
    if (!rateCheck.success) {
      apiLog(`[${reqId}] Rate limited`);
      return NextResponse.json({ error: "Rate limit exceeded.", retryAfter: rateCheck.reset }, { status: 429 });
    }
    apiLog(`[${reqId}] Rate OK`);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    apiLog(`[${reqId}] User found`, { credits: user.credits });

    const body = await request.json();
    const { images, count = 4, selectedTypes, customPrompts } = body;
    apiLog(`[${reqId}] Body parsed`, { images: images?.length, count, selectedTypes: selectedTypes?.length });

    if (!images || !Array.isArray(images) || images.length < 2) {
      return NextResponse.json({ error: "At least 2 reference images required" }, { status: 400 });
    }

    const promptEditEnabled = customPrompts && Object.keys(customPrompts).length > 0;
    const creditCost = count + (promptEditEnabled ? 2 : 0);
    if (user.credits < creditCost) {
      apiLog(`[${reqId}] Insufficient credits`);
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

    await prisma.user.update({ where: { id: user.id }, data: { credits: user.credits - creditCost } });
    apiLog(`[${reqId}] Credits deducted`, { cost: creditCost, remaining: user.credits - creditCost });

    const portraitSession = await prisma.portraitSessionRecord.create({
      data: { userId: user.id, images: JSON.stringify(images), portraits: JSON.stringify([]) },
    });
    apiLog(`[${reqId}] Session created`, { sessionId: portraitSession.id });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      apiError(`[${reqId}] Missing OPENAI_API_KEY`);
      throw new Error("API key not configured");
    }
    apiLog(`[${reqId}] OPENAI_API_KEY present`, { length: apiKey.length });

    const refBlobs = images.map(base64ToBlob);
    apiLog(`[${reqId}] Reference blobs created`, { count: refBlobs.length, sizes: refBlobs.map((b) => b.size) });

    const results = await Promise.allSettled(
      briefs.map(async (brief, idx) => {
        const effectivePrompt = customPrompts?.[brief.id] || brief.prompt;
        apiLog(`[${reqId}] Brief ${idx} start`, { style: brief.id, promptLen: effectivePrompt.length });

        const formData = new FormData();
        formData.append("model", "gpt-image-2");
        for (const blob of refBlobs) {
          formData.append("image", blob, "reference.png");
        }
        formData.append("prompt", effectivePrompt);
        formData.append("n", "1");
        formData.append("size", "1024x1024");
        formData.append("response_format", "b64_json");

        const openaiStart = Date.now();
        apiLog(`[${reqId}] Fetching OpenAI /v1/images/edits for ${brief.id}`);

        const resp = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: formData,
        });

        const elapsed = Date.now() - openaiStart;
        apiLog(`[${reqId}] OpenAI respond ${brief.id}`, { status: resp.status, elapsed: `${elapsed}ms` });

        if (!resp.ok) {
          const errText = await resp.text();
          apiError(`[${reqId}] OpenAI error ${brief.id}`, { status: resp.status, body: errText.slice(0, 500) });
          throw new Error(`OpenAI edits error (${resp.status}): ${errText.slice(0, 200)}`);
        }

        const data = await resp.json();
        const b64 = data.data?.[0]?.b64_json;
        if (!b64) {
          apiError(`[${reqId}] No b64_json for ${brief.id}`);
          throw new Error("No image data in response");
        }
        apiLog(`[${reqId}] OpenAI OK ${brief.id}`, { b64Len: b64.length });

        const buffer = Buffer.from(b64, "base64");
        const watermarked = await applyWatermark(buffer, false);
        const finalB64 = watermarked.toString("base64");
        apiLog(`[${reqId}] Done ${brief.id}`, { finalSize: finalB64.length });

        return { style: brief.id, url: `data:image/jpeg;base64,${finalB64}` };
      })
    );

    const generatedPortraits = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return { id: `portrait-${index}`, style: result.value.style, url: result.value.url, status: "completed" as const };
      }
      const reason = result.reason?.message || "Generation failed.";
      apiError(`[${reqId}] Portrait ${index} failed`, { error: reason.slice(0, 200) });
      return { id: `portrait-${index}`, style: briefs[index]?.id || "unknown", url: "", status: "error" as const, error: reason };
    });

    const successCount = generatedPortraits.filter((p) => p.status === "completed").length;
    apiLog(`[${reqId}] Done`, { total: generatedPortraits.length, success: successCount, failed: generatedPortraits.length - successCount });

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
    console.error("Generation error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
