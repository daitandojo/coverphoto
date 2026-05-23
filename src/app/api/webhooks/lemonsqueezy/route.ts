import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const PRICE_CREDITS: Record<string, number> = {
  "price_10": 10,
  "price_50": 50,
  "price_100": 100,
};

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-signature") || "";

    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (webhookSecret && !verifySignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const eventName = data.meta?.event_name;

    if (eventName === "order_created") {
      const email = data.data?.attributes?.user_email;
      const variantId = data.data?.attributes?.first_order_item?.variant_id;
      const priceId = data.data?.attributes?.first_order_item?.price_id;

      const credits = PRICE_CREDITS[priceId || variantId] || 0;

      if (email && credits > 0) {
        await prisma.user.update({
          where: { email },
          data: { credits: { increment: credits } },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
