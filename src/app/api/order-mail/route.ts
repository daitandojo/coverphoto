import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, address, size, option, totalCost } = await request.json();

    // Send email notification
    const emailContent = `
New Print Order
────────────────
Name: ${name}
Address: ${address}
Size: ${size}
Finish: ${option}
Total Cost: ${totalCost} credits
────────────────
    `.trim();

    // In production, integrate with SendGrid/Resend/Amazon SES.
    // For now, log the order. The user can retrieve from logs.
    console.log("=== PRINT ORDER ===");
    console.log(emailContent);
    console.log("====================");

    // Send email using SMTP or email service
    // If no email service is configured, the order is logged
    const emailApi = process.env.EMAIL_API_KEY;
    const emailTo = process.env.ORDER_EMAIL || "coverphoto@gmail.com";

    if (emailApi && emailTo) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${emailApi}`,
        },
        body: JSON.stringify({
          from: "orders@coverphoto.vercel.app",
          to: emailTo,
          subject: "New Print Order - CoverPhoto",
          text: emailContent,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: "Order received. We will process it shortly." });
  } catch {
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}
