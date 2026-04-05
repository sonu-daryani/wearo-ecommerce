import { getPublicCompanySettings } from "@/lib/company-settings";
import { getProviderSecretsFromDb } from "@/lib/payment-secrets-db";
import prisma from "@/lib/prisma";
import { cashfreeCreateOrder, cashfreeJsMode } from "@/lib/payments/cashfree-server";
import { razorpayCreateOrder } from "@/lib/payments/razorpay-server";
import { stripeCreateCheckoutSession } from "@/lib/payments/stripe-server";
import type { CreateSessionResult, PaymentSessionPayload } from "@/lib/payments/types";
import { isPaymentProviderId } from "@/lib/payments/types";

export async function createPaymentSessionForPublicToken(
  publicToken: string,
  origin: string
): Promise<CreateSessionResult> {
  if (!origin.trim()) {
    return { ok: false, error: "Could not determine site URL.", status: 500 };
  }

  const order = await prisma.order.findUnique({ where: { publicToken } });
  if (!order) {
    return { ok: false, error: "Order not found.", status: 404 };
  }
  if (order.paymentMethod !== "online" || !order.paymentProvider) {
    return { ok: false, error: "Invalid order for online checkout.", status: 400 };
  }
  if (order.paymentStatus !== "PENDING" || order.status !== "PENDING_PAYMENT") {
    return { ok: false, error: "This order is not awaiting payment.", status: 400 };
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
      return {
        ok: false,
        error:
          "Cashfree is not configured: save App ID and secret key in Admin → Payment settings.",
        status: 503,
      };
    }

    const shipping = order.shipping as { fullName?: string; email?: string; phone?: string };
    const customerName = String(shipping.fullName ?? "Customer").trim() || "Customer";
    const customerEmail = String(shipping.email ?? "").trim();
    const customerPhone = String(shipping.phone ?? "").trim().replace(/\s/g, "") || "0000000000";
    if (!customerEmail) {
      return { ok: false, error: "Order has no customer email.", status: 400 };
    }

    const returnUrl = `${origin}/checkout/payment-return?token=${encodeURIComponent(publicToken)}&provider=CASHFREE`;

    const created = await cashfreeCreateOrder({
      clientId: appId,
      clientSecret: secret,
      orderId: order.orderNumber,
      orderAmount: order.grandTotal,
      orderCurrency: order.currencyCode,
      customerName,
      customerEmail,
      customerPhone,
      returnUrl,
    });

    if (!created.ok) {
      return { ok: false, error: created.error, status: 502 };
    }

    const payload: PaymentSessionPayload = {
      provider: "CASHFREE",
      paymentSessionId: created.paymentSessionId,
      cashfreeMode: cashfreeJsMode(),
    };
    return { ok: true, payload };
  }

  if (provider === "STRIPE") {
    const sk = secrets.stripeSecretKey?.trim();
    if (!company.stripePublishableKey?.trim() || !sk) {
      return {
        ok: false,
        error:
          "Stripe is not configured: save publishable and secret keys in Admin → Payment settings.",
        status: 503,
      };
    }

    const created = await stripeCreateCheckoutSession({
      order,
      publicToken,
      companyName: company.companyName,
      origin,
      stripeSecretKey: sk,
    });
    if (!created.ok) {
      return { ok: false, error: created.error, status: 502 };
    }

    return { ok: true, payload: { provider: "STRIPE", checkoutUrl: created.url } };
  }

  if (provider === "RAZORPAY") {
    const keyId = company.razorpayKeyId?.trim();
    const keySecret = secrets.razorpayKeySecret?.trim();
    if (!keyId || !keySecret) {
      return {
        ok: false,
        error:
          "Razorpay is not configured: save Key ID and secret in Admin → Payment settings.",
        status: 503,
      };
    }

    const rz = await razorpayCreateOrder({ order, publicToken, keyId, keySecret });
    if (!rz.ok) {
      return { ok: false, error: rz.error, status: 502 };
    }

    const shipping = order.shipping as { fullName?: string; email?: string; phone?: string };
    const payload: PaymentSessionPayload = {
      provider: "RAZORPAY",
      keyId,
      orderId: rz.razorpayOrderId,
      amount: rz.amount,
      currency: rz.currency,
      companyName: company.companyName,
      description: `Order ${order.orderNumber}`,
      customerName: String(shipping.fullName ?? "Customer").trim() || "Customer",
      customerEmail: String(shipping.email ?? "").trim(),
      customerContact: String(shipping.phone ?? "").trim().replace(/\s/g, "") || "0000000000",
    };
    return { ok: true, payload };
  }

  return { ok: false, error: "Unsupported payment provider.", status: 400 };
}
