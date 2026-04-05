import { getPublicCompanySettings } from "@/lib/company-settings";
import { markOnlinePaymentPaid } from "@/lib/orders/create-order";
import { getProviderSecretsFromDb } from "@/lib/payment-secrets-db";
import prisma from "@/lib/prisma";
import { cashfreeGetOrderStatus } from "@/lib/payments/cashfree-server";
import {
  razorpayFetchPaymentCaptured,
  razorpayVerifySignature,
} from "@/lib/payments/razorpay-server";
import { stripeVerifyCheckoutSession } from "@/lib/payments/stripe-server";
import type { VerifyResult } from "@/lib/payments/types";
import { isPaymentProviderId } from "@/lib/payments/types";

function razorpayAuthHeader(keyId: string, keySecret: string): string {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function verifyOnlinePayment(input: {
  publicToken: string;
  stripeSessionId?: string | null;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  razorpaySignature?: string | null;
}): Promise<VerifyResult> {
  const publicToken = input.publicToken.trim();
  const order = await prisma.order.findUnique({ where: { publicToken } });
  if (!order) {
    return { ok: false, error: "Order not found.", status: 404 };
  }
  if (order.paymentMethod !== "online" || !order.paymentProvider) {
    return { ok: false, error: "Invalid payment flow.", status: 400 };
  }
  if (order.paymentStatus === "PAID") {
    return { ok: true };
  }
  if (order.paymentStatus !== "PENDING") {
    return { ok: false, error: "Payment cannot be completed for this order.", status: 400 };
  }

  const provider = order.paymentProvider;
  if (!isPaymentProviderId(provider)) {
    return { ok: false, error: "Unsupported payment provider.", status: 400 };
  }

  const company = await getPublicCompanySettings();
  const secrets = await getProviderSecretsFromDb();

  if (provider === "CASHFREE") {
    const secret = secrets.cashfreeClientSecret?.trim();
    const appId = company.cashfreeAppId?.trim();
    if (!secret || !appId) {
      return { ok: false, error: "Cashfree secret is missing in company settings.", status: 503 };
    }
    const st = await cashfreeGetOrderStatus({
      clientId: appId,
      clientSecret: secret,
      orderId: order.orderNumber,
    });
    if (!st.ok) {
      return { ok: false, error: st.error, status: 502 };
    }
    if (st.orderStatus !== "PAID") {
      return {
        ok: false,
        error: `Payment not completed (status: ${st.orderStatus}).`,
        status: 409,
      };
    }
  } else if (provider === "STRIPE") {
    const sid = input.stripeSessionId?.trim();
    if (!sid) {
      return { ok: false, error: "Missing Stripe session id.", status: 400 };
    }
    const sk = secrets.stripeSecretKey?.trim();
    if (!sk) {
      return { ok: false, error: "Stripe secret is missing in company settings.", status: 503 };
    }
    const v = await stripeVerifyCheckoutSession({
      sessionId: sid,
      publicToken,
      expectedAmount: order.grandTotal,
      currencyCode: order.currencyCode,
      stripeSecretKey: sk,
    });
    if (!v.ok) {
      return { ok: false, error: v.error, status: 400 };
    }
  } else if (provider === "RAZORPAY") {
    const pid = input.razorpayPaymentId?.trim();
    const oid = input.razorpayOrderId?.trim();
    const sig = input.razorpaySignature?.trim();
    if (!pid || !oid || !sig) {
      return { ok: false, error: "Missing Razorpay payment details.", status: 400 };
    }
    const keySecret = secrets.razorpayKeySecret?.trim();
    const keyId = company.razorpayKeyId?.trim();
    if (!keySecret || !keyId) {
      return { ok: false, error: "Razorpay secret is missing in company settings.", status: 503 };
    }
    if (!razorpayVerifySignature(oid, pid, sig, keySecret)) {
      return { ok: false, error: "Invalid Razorpay signature.", status: 400 };
    }
    const cap = await razorpayFetchPaymentCaptured(pid, keyId, keySecret);
    if (!cap.ok) {
      return { ok: false, error: cap.error, status: 409 };
    }
    const or = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(oid)}`, {
      headers: { Authorization: razorpayAuthHeader(keyId, keySecret) },
    });
    const od = (await or.json().catch(() => ({}))) as { notes?: { publicToken?: string } };
    if (od.notes?.publicToken !== publicToken) {
      return { ok: false, error: "Razorpay order does not match this checkout.", status: 400 };
    }
  }

  const marked = await markOnlinePaymentPaid(publicToken);
  if (!marked.ok) {
    return { ok: false, error: marked.error ?? "Could not update order.", status: 400 };
  }
  return { ok: true };
}
