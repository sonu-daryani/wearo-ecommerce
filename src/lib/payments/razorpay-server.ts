import { createHmac, timingSafeEqual } from "crypto";
import { amountToStripeUnit } from "@/lib/payments/stripe-server";

function authHeader(keyId: string, keySecret: string): string {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function razorpayCreateOrder(params: {
  orderNumber: string;
  grandTotal: number;
  currencyCode: string;
  publicToken: string;
  keyId: string;
  keySecret: string;
}): Promise<
  { ok: true; razorpayOrderId: string; amount: number; currency: string } | { ok: false; error: string }
> {
  const amount = amountToStripeUnit(params.grandTotal, params.currencyCode);
  if (amount < 1) {
    return { ok: false, error: "Order amount is too small for Razorpay." };
  }

  const body = {
    amount,
    currency: params.currencyCode.toUpperCase(),
    receipt: params.orderNumber.slice(0, 40),
    notes: {
      publicToken: params.publicToken,
      orderNumber: params.orderNumber,
    },
  };

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(params.keyId, params.keySecret),
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const err = data.error as { description?: string } | undefined;
    const msg = err?.description ?? `Razorpay order failed (${res.status})`;
    return { ok: false, error: msg };
  }

  const id = typeof data.id === "string" ? data.id : null;
  if (!id) {
    return { ok: false, error: "Razorpay did not return an order id." };
  }

  return {
    ok: true,
    razorpayOrderId: id,
    amount,
    currency: params.currencyCode.toUpperCase(),
  };
}

export function razorpayVerifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"));
  } catch {
    return false;
  }
}

export async function razorpayFetchPaymentCaptured(
  paymentId: string,
  keyId: string,
  keySecret: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authHeader(keyId, keySecret) },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return { ok: false, error: "Could not load Razorpay payment." };
  }
  if (data.status !== "captured" && data.status !== "authorized") {
    return { ok: false, error: `Razorpay payment status: ${String(data.status)}.` };
  }
  return { ok: true };
}
