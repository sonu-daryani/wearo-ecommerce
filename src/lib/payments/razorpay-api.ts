import { createHmac } from "crypto";

function basicAuth(keyId: string, keySecret: string): string {
  return Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

export async function createRazorpayOrder(params: {
  keyId: string;
  keySecret: string;
  amountSubunit: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string } | { error: string }> {
  const auth = basicAuth(params.keyId, params.keySecret);
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: params.amountSubunit,
      currency: params.currency,
      receipt: params.receipt.slice(0, 40),
      notes: params.notes ?? {},
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    error?: { description?: string };
  };
  if (!res.ok) {
    const msg =
      typeof data?.error?.description === "string"
        ? data.error.description
        : "Could not create Razorpay order.";
    return { error: msg };
  }
  if (!data?.id) return { error: "Invalid Razorpay response." };
  return { id: data.id };
}

/** Validates webhook-style signature and payment details against Razorpay API. */
export async function verifyRazorpayPaymentCaptured(params: {
  keyId: string;
  keySecret: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  expectedAmountSubunit: number;
}): Promise<boolean> {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    keySecret,
    keyId,
    expectedAmountSubunit,
  } = params;
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSig = createHmac("sha256", keySecret).update(body).digest("hex");
  if (expectedSig !== razorpaySignature) return false;

  const auth = basicAuth(keyId, keySecret);
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const payment = (await res.json().catch(() => null)) as {
    order_id?: string;
    status?: string;
    amount?: number;
  } | null;
  if (!payment || payment.order_id !== razorpayOrderId) return false;
  if (payment.status !== "captured" && payment.status !== "authorized") return false;
  return Number(payment.amount) === expectedAmountSubunit;
}

export function grandTotalToRazorpayAmountSubunit(grandTotal: number, currencyCode: string, decimalPlaces: number): number {
  const decimals = currencyCode === "JPY" ? 0 : Math.min(4, Math.max(0, decimalPlaces || 2));
  const mult = 10 ** decimals;
  return Math.round(Number(grandTotal) * mult);
}
