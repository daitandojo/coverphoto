import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventName = body.meta?.event_name;

    // Verify webhook signature in production
    if (eventName === "order_created") {
      const email = body.data?.attributes?.user_email;
      const credits = calculateCredits(body.data?.attributes?.first_order_item?.price_id);

      if (email && credits > 0) {
        await prisma.user.update({
          where: { email },
          data: { credits: { increment: credits } },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function calculateCredits(priceId?: string): number {
  const priceMap: Record<string, number> = {
    // Configure these based on your Lemon Squeezy price IDs
    "price_50": 50,
    "price_200": 200,
    "price_500": 500,
  };
  return priceId ? priceMap[priceId] || 0 : 0;
}
