import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyWatermark } from "@/lib/watermark";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const PORTRAIT_BRIEFS = [
  {
    style: "executive",
    prompt: `You are Marcus Sterling, lead portrait photographer at PortraitStudio, whose client list includes Fortune 500 CEOs and world leaders. Your brief for this portrait:

COMPOSITION: Tight head-and-shoulders frame, subject looking directly into the lens with quiet authority. Rule of thirds positioning, shallow depth of field.

WARDROBE: Charcoal wool suit, white poplin shirt, no tie — the CFO who closed the deal but loosened his collar at dinner.

LIGHTING: Rembrandt lighting setup. Single key light at 45°, soft fill. Deep shadows on the far cheek.

MOOD: Composed power. This is a person who makes decisions that move markets.

TECHNICAL: Photorealistic, 85mm portrait lens equivalent, f/1.8, Canon R5, RAW file quality. Studio backdrop: seamless grey.

SUBJECT FIDELITY: The subject must be an exact likeness of the person in the reference images. Preserve: facial structure, eye colour, skin tone, age, distinguishing features. This is a portrait commission, not an idealisation.`,
  },
  {
    style: "founder",
    prompt: `You are Elena Vasquez, lead portrait photographer at PortraitStudio, known for capturing the new generation of innovators. Your brief for this portrait:

COMPOSITION: Slight three-quarter turn, subject leaning slightly forward, hands loosely clasped. Environmental portrait feel.

WARDROBE: Smart-casual — charcoal merino crewneck, tailored chinos, no jacket. The founder who just pitched and won.

LIGHTING: Warm ambient key light from camera-left, subtle rim light revealing jawline. Soft, inviting shadows.

MOOD: Approachable ambition. This person is building the future and welcomes you to join.

TECHNICAL: Photorealistic, 50mm portrait lens equivalent, f/2.0, Canon R5, RAW file quality. Studio backdrop: warm taupe.

SUBJECT FIDELITY: The subject must be an exact likeness of the person in the reference images. Preserve: facial structure, eye colour, skin tone, age, distinguishing features. This is a portrait commission, not an idealisation.`,
  },
  {
    style: "statesperson",
    prompt: `You are James Whitfield, lead portrait photographer at PortraitStudio, whose work hangs in galleries and government buildings. Your brief for this portrait:

COMPOSITION: Formal standing pose, subject's body angled three-quarters, head turned to camera. Architectural frame with leading lines.

WARDROBE: Black tie perfection — midnight velvet dinner jacket, crisp white formal shirt, black bow tie. Or floor-length evening gown with subtle jewellery.

LIGHTING: Dramatic split lighting. Main key at 90°, deep chiaroscuro. A single silver reflector for catchlights.

MOOD: Dignified presence. This is a statesperson whose decisions shape history.

TECHNICAL: Photorealistic, 70mm portrait lens equivalent, f/2.8, Canon R5, RAW file quality. Background: architectural column detail with soft shadow.

SUBJECT FIDELITY: The subject must be an exact likeness of the person in the reference images. Preserve: facial structure, eye colour, skin tone, age, distinguishing features. This is a portrait commission, not an idealisation.`,
  },
  {
    style: "outdoors",
    prompt: `You are River Chen, lead portrait photographer at PortraitStudio, celebrated for environmental portraiture. Your brief for this portrait:

COMPOSITION: Wide shoulders, head slightly tilted, looking into the distance beyond camera. Natural environmental framing.

WARDROBE: Open-collar linen shirt in ivory, sleeves rolled once. Light khaki field jacket draped over shoulder.

LIGHTING: Golden hour simulation — warm key light at 15° above, long shadows, lens flare kiss on the left edge. Gentle wind stirs the hair.

MOOD: Quiet confidence. This person is at home in the world, comfortable in their own skin.

TECHNICAL: Photorealistic, 35mm portrait lens equivalent, f/2.0, Canon R5, RAW file quality. Background: soft-focus natural landscape with bokeh.

SUBJECT FIDELITY: The subject must be an exact likeness of the person in the reference images. Preserve: facial structure, eye colour, skin tone, age, distinguishing features. This is a portrait commission, not an idealisation.`,
  },
];

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit by user email
    const rateCheck = await checkRateLimit(session.user.email);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Try again later.",
          retryAfter: rateCheck.reset,
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.credits < 4) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    const { images } = await request.json();
    if (!images || !Array.isArray(images) || images.length < 2) {
      return NextResponse.json({ error: "At least 2 reference images required" }, { status: 400 });
    }

    // Deduct credits server-side
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: user.credits - 4 },
    });

    // Create session record
    const portraitSession = await prisma.portraitSessionRecord.create({
      data: {
        userId: user.id,
        images: JSON.stringify(images),
        portraits: JSON.stringify([]),
      },
    });

    // Generate all 4 portraits in parallel using Replicate SDXL + IP-Adapter
    const results = await Promise.allSettled(
      PORTRAIT_BRIEFS.map(async (brief) => {
        // Use SDXL with IP-Adapter for face-consistent generation
        const output = await replicate.run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          {
            input: {
              prompt: brief.prompt,
              negative_prompt: "cartoon, anime, illustration, painting, distorted face, bad anatomy",
              width: 1024,
              height: 1024,
              num_outputs: 1,
              scheduler: "DPMSolverMultistep",
              num_inference_steps: 30,
              guidance_scale: 7,
              // IP-Adapter face conditioning using reference images
              ip_adapter_image: images[0],
              ip_adapter_scale: 0.6,
            },
          }
        );

        const imageUrl = Array.isArray(output) ? output[0] : output;
        if (!imageUrl || typeof imageUrl !== "string") {
          throw new Error("No image generated");
        }

        // Download image for watermarking
        const response = await fetch(imageUrl);
        const buffer = Buffer.from(await response.arrayBuffer());

        // Apply watermark for free-tier users
        const isPaid = false; // Check user's subscription status in production
        const watermarked = await applyWatermark(buffer, isPaid);

        // Convert to base64 for storage
        const b64 = watermarked.toString("base64");
        const dataUrl = `data:image/jpeg;base64,${b64}`;

        return { style: brief.style, url: dataUrl };
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
        style: PORTRAIT_BRIEFS[index].style,
        url: "",
        status: "error" as const,
        error: "Generation failed. Please retry.",
      };
    });

    // Update session record with generated portraits
    await prisma.portraitSessionRecord.update({
      where: { id: portraitSession.id },
      data: { portraits: JSON.stringify(generatedPortraits) },
    });

    return NextResponse.json({
      sessionId: portraitSession.id,
      portraits: generatedPortraits,
      creditsRemaining: user.credits - 4,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
