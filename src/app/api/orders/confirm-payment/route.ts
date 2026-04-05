import { NextResponse } from "next/server";
import { markOnlinePaymentPaid } from "@/lib/orders/create-order";

export const dynamic = "force-dynamic";

/**
 * Call after your payment gateway reports success (Razorpay/Stripe/Cashfree webhook or redirect).
 * Demo: the checkout UI calls this with `publicToken` after `/api/orders/place` for online orders.
 * Production: disable client-triggered confirmation — set `DISABLE_CLIENT_ORDER_PAYMENT_CONFIRM=true` and only
 * mark orders paid from verified webhooks.
 */
export async function POST(req: Request) {
  if (process.env.DISABLE_CLIENT_ORDER_PAYMENT_CONFIRM === "true") {
    return NextResponse.json(
      { error: "Client payment confirmation is disabled. Use a verified webhook." },
      { status: 403 }
    );
  }
  let body: { publicToken?: string };
  try {
    body = (await req.json()) as { publicToken?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const publicToken = body.publicToken?.trim();
  if (!publicToken) {
    return NextResponse.json({ error: "Missing publicToken." }, { status: 400 });
  }

  const result = await markOnlinePaymentPaid(publicToken);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Failed." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
