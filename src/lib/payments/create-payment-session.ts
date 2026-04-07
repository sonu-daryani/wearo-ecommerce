import { getPublicCompanySettings } from "@/lib/company-settings";
import { decodeOnlineCheckoutIntentToken } from "@/lib/checkout-intent";
import { getProviderSecretsFromDb } from "@/lib/payment-secrets-db";
import { resolveProviderCredentials } from "@/lib/payments/provider-config";
import {
  cashfreeCreateOrder,
  cashfreeJsMode,
} from "@/lib/payments/cashfree-api";
import { payuPaymentEndpoint, payuPaymentRequestHash } from "@/lib/payments/payu-hash";
import {
  createRazorpayOrder,
  grandTotalToRazorpayAmountSubunit,
} from "@/lib/payments/razorpay-api";
import type { CreateSessionResult, PaymentSessionPayload } from "@/lib/payments/types";
import { isPaymentProviderId } from "@/lib/payments/types";
import prisma from "@/lib/prisma";

export async function createPaymentSessionForCheckoutIntent(
  checkoutToken: string,
  origin: string
): Promise<CreateSessionResult> {
  if (!origin.trim()) {
    return { ok: false, error: "Could not determine site URL.", status: 500 };
  }

  const intent = decodeOnlineCheckoutIntentToken(checkoutToken);
  if (!intent) {
    return { ok: false, error: "Invalid or expired checkout token.", status: 400 };
  }

  const provider = intent.paymentProvider;
  if (!isPaymentProviderId(provider)) {
    return { ok: false, error: "Unsupported payment provider.", status: 400 };
  }

  const company = await getPublicCompanySettings();
  const secrets = await getProviderSecretsFromDb();

  const creds = resolveProviderCredentials(provider, company, secrets);
  if (!creds) {
    return { ok: false, error: `${provider} credentials are not configured.`, status: 503 };
  }

  const orderRow = await prisma.order.findUnique({
    where: { publicToken: intent.publicToken.trim() },
    select: {
      publicToken: true,
      orderNumber: true,
      grandTotal: true,
      paymentStatus: true,
      paymentMethod: true,
    },
  });
  if (!orderRow || orderRow.paymentMethod !== "online") {
    return { ok: false, error: "Order not found for this checkout.", status: 404 };
  }
  if (orderRow.paymentStatus !== "PENDING") {
    return { ok: false, error: "This order is not awaiting payment.", status: 400 };
  }
  if (Math.abs(orderRow.grandTotal - intent.grandTotal) > 0.02) {
    return { ok: false, error: "Order total mismatch. Start checkout again.", status: 400 };
  }

  if (provider === "RAZORPAY" && creds.provider === "RAZORPAY") {
    const amountSubunit = grandTotalToRazorpayAmountSubunit(
      intent.grandTotal,
      intent.currencyCode,
      company.currency.decimalPlaces
    );
    if (amountSubunit < 100 && intent.currencyCode === "INR") {
      return { ok: false, error: "Order amount is below the minimum for Razorpay (₹1).", status: 400 };
    }

    const rzOrder = await createRazorpayOrder({
      keyId: creds.id,
      keySecret: creds.secret,
      amountSubunit,
      currency: intent.currencyCode,
      receipt: intent.orderNumber,
      notes: { publicToken: intent.publicToken, orderNumber: intent.orderNumber },
    });
    if ("error" in rzOrder) {
      return { ok: false, error: rzOrder.error, status: 502 };
    }

    const payload: PaymentSessionPayload = {
      provider: "RAZORPAY",
      keyId: creds.id,
      orderId: rzOrder.id,
      amount: amountSubunit,
      currency: intent.currencyCode,
      companyName: company.companyName,
      orderNumber: intent.orderNumber,
      publicToken: intent.publicToken,
      prefill: {
        name: intent.shipping.fullName,
        email: intent.shipping.email,
        contact: intent.shipping.phone,
      },
    };
    return { ok: true, payload };
  }

  if (provider === "CASHFREE" && creds.provider === "CASHFREE") {
    const phone = intent.shipping.phone.replace(/\D/g, "").slice(0, 15) || "9999999999";
    const cfOrder = await cashfreeCreateOrder({
      clientId: creds.id,
      clientSecret: creds.secret,
      body: {
        order_id: intent.orderNumber,
        order_amount: Number(Number(intent.grandTotal).toFixed(2)),
        order_currency: intent.currencyCode,
        customer_details: {
          customer_id: intent.publicToken.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || intent.orderNumber,
          customer_name: intent.shipping.fullName.slice(0, 100),
          customer_email: intent.shipping.email.slice(0, 100),
          customer_phone: phone,
        },
        order_meta: {
          return_url: `${origin.replace(/\/$/, "")}/checkout/payment-return?token=${encodeURIComponent(intent.publicToken)}`,
        },
      },
    });
    if ("error" in cfOrder) {
      return { ok: false, error: cfOrder.error, status: 502 };
    }
    const payload: PaymentSessionPayload = {
      provider: "CASHFREE",
      paymentSessionId: cfOrder.payment_session_id,
      publicToken: intent.publicToken,
      env: cashfreeJsMode(),
    };
    return { ok: true, payload };
  }

  if (provider === "PAYU" && creds.provider === "PAYU") {
    const amountStr = Number(intent.grandTotal).toFixed(2);
    const productinfo = `Order ${intent.orderNumber}`.slice(0, 100);
    const firstname = intent.shipping.fullName.trim().split(/\s+/)[0] || "Customer";
    const email = intent.shipping.email.trim();
    const txnid = intent.orderNumber;
    const key = creds.id;
    const hash = payuPaymentRequestHash({
      key,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
      salt: creds.secret,
    });
    const baseOrigin = origin.replace(/\/$/, "");
    const callbackUrl = `${baseOrigin}/api/payments/payu-callback`;
    const fields: Record<string, string> = {
      key,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
      phone: intent.shipping.phone.replace(/\D/g, "").slice(0, 15) || "9999999999",
      surl: callbackUrl,
      furl: callbackUrl,
      hash,
    };
    const payload: PaymentSessionPayload = {
      provider: "PAYU",
      actionUrl: payuPaymentEndpoint(),
      fields,
      publicToken: intent.publicToken,
    };
    return { ok: true, payload };
  }

  return {
    ok: false,
    error: `${provider} checkout is not integrated yet. Try Razorpay, Cashfree, PayU, or COD.`,
    status: 501,
  };
}
