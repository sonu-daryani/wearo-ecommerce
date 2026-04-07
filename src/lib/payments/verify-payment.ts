import { getPublicCompanySettings } from "@/lib/company-settings";
import { decodeOnlineCheckoutIntentToken } from "@/lib/checkout-intent";
import { markOnlinePaymentPaid } from "@/lib/orders/create-order";
import { cashfreeFetchOrder } from "@/lib/payments/cashfree-api";
import { payuVerifyResponseHash } from "@/lib/payments/payu-hash";
import { getProviderSecretsFromDb } from "@/lib/payment-secrets-db";
import { resolveProviderCredentials } from "@/lib/payments/provider-config";
import {
  grandTotalToRazorpayAmountSubunit,
  verifyRazorpayPaymentCaptured,
} from "@/lib/payments/razorpay-api";
import type { VerifyResult } from "@/lib/payments/types";
import { isPaymentProviderId } from "@/lib/payments/types";
import prisma from "@/lib/prisma";

async function verifyCashfreeForOrder(order: {
  publicToken: string;
  orderNumber: string;
  grandTotal: number;
  currencyCode: string;
  paymentStatus: string;
}): Promise<VerifyResult> {
  const company = await getPublicCompanySettings();
  const secrets = await getProviderSecretsFromDb();
  const creds = resolveProviderCredentials("CASHFREE", company, secrets);
  if (!creds || creds.provider !== "CASHFREE") {
    return { ok: false, error: "Cashfree is not configured.", status: 503 };
  }

  const cf = await cashfreeFetchOrder({
    clientId: creds.id,
    clientSecret: creds.secret,
    merchantOrderId: order.orderNumber,
  });
  if ("error" in cf) {
    return { ok: false, error: cf.error, status: 502 };
  }
  if (cf.order_status !== "PAID") {
    return { ok: false, error: "Payment is not completed yet.", status: 400 };
  }
  if (cf.order_currency !== order.currencyCode) {
    return { ok: false, error: "Currency mismatch.", status: 400 };
  }
  if (Math.abs(cf.order_amount - order.grandTotal) > 0.02) {
    return { ok: false, error: "Amount mismatch.", status: 400 };
  }

  const marked = await markOnlinePaymentPaid(order.publicToken);
  if (!marked.ok) {
    return { ok: false, error: marked.error ?? "Could not finalize order.", status: 500 };
  }
  return { ok: true, paid: true };
}

/** After Cashfree redirect/modal: confirm status with Cashfree API (no client secret in browser). */
async function verifyByPublicTokenOnly(publicToken: string): Promise<VerifyResult> {
  const order = await prisma.order.findUnique({
    where: { publicToken },
  });
  if (!order) {
    return { ok: false, error: "Order not found.", status: 404 };
  }
  if (order.paymentStatus === "PAID") {
    return { ok: true, paid: true };
  }
  if (order.paymentStatus !== "PENDING" || order.paymentMethod !== "online") {
    return { ok: false, error: "Payment cannot be completed for this order.", status: 400 };
  }

  const provider = order.paymentProvider?.trim() ?? "";
  if (provider === "CASHFREE") {
    return verifyCashfreeForOrder({
      publicToken: order.publicToken,
      orderNumber: order.orderNumber,
      grandTotal: order.grandTotal,
      currencyCode: order.currencyCode,
      paymentStatus: order.paymentStatus,
    });
  }

  return {
    ok: false,
    error: "Use the payment provider return flow for this order.",
    status: 400,
  };
}

export async function verifyOnlinePayment(input: {
  checkoutToken?: string;
  publicToken?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}): Promise<VerifyResult> {
  const publicOnly = input.publicToken?.trim();
  const checkoutToken = input.checkoutToken?.trim();

  if (!checkoutToken && publicOnly) {
    return verifyByPublicTokenOnly(publicOnly);
  }

  if (!checkoutToken) {
    return { ok: false, error: "Missing checkout token or order reference.", status: 400 };
  }

  const intent = decodeOnlineCheckoutIntentToken(checkoutToken);
  if (!intent) {
    return { ok: false, error: "Invalid or expired checkout token.", status: 400 };
  }

  const order = await prisma.order.findUnique({
    where: { publicToken: intent.publicToken.trim() },
  });
  if (!order) {
    return { ok: false, error: "Order not found.", status: 404 };
  }
  if (order.paymentStatus === "PAID") {
    return { ok: true, paid: true };
  }
  if (order.paymentStatus !== "PENDING" || order.paymentMethod !== "online") {
    return { ok: false, error: "Payment cannot be completed for this order.", status: 400 };
  }
  if (Math.abs(order.grandTotal - intent.grandTotal) > 0.02) {
    return { ok: false, error: "Order total mismatch.", status: 400 };
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

  if (provider === "CASHFREE" && creds.provider === "CASHFREE") {
    return verifyCashfreeForOrder({
      publicToken: order.publicToken,
      orderNumber: order.orderNumber,
      grandTotal: order.grandTotal,
      currencyCode: order.currencyCode,
      paymentStatus: order.paymentStatus,
    });
  }

  if (provider === "RAZORPAY" && creds.provider === "RAZORPAY") {
    const razorpayPaymentId = input.razorpayPaymentId?.trim();
    const razorpayOrderId = input.razorpayOrderId?.trim();
    const razorpaySignature = input.razorpaySignature?.trim();
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return { ok: false, error: "Missing Razorpay payment details.", status: 400 };
    }

    const expectedAmount = grandTotalToRazorpayAmountSubunit(
      order.grandTotal,
      order.currencyCode,
      company.currency.decimalPlaces
    );

    const valid = await verifyRazorpayPaymentCaptured({
      keyId: creds.id,
      keySecret: creds.secret,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      expectedAmountSubunit: expectedAmount,
    });

    if (!valid) {
      return { ok: false, error: "Payment verification failed.", status: 400 };
    }

    const marked = await markOnlinePaymentPaid(intent.publicToken.trim());
    if (!marked.ok) {
      return { ok: false, error: marked.error ?? "Could not finalize order.", status: 500 };
    }
    return { ok: true, paid: true };
  }

  return { ok: false, error: `${provider} verification is not implemented for this flow.`, status: 501 };
}

/** PayU browser POST to surl/furl — verify hash and mark paid. */
export async function verifyPayuCallbackForm(form: URLSearchParams): Promise<
  | { ok: true; publicToken: string }
  | { ok: false; error: string; publicToken?: string }
> {
  const txnid = form.get("txnid")?.trim() ?? "";
  const status = form.get("status")?.trim() ?? "";
  const receivedHash = form.get("hash")?.trim() ?? "";
  const key = form.get("key")?.trim() ?? "";
  const amount = form.get("amount")?.trim() ?? "";
  const productinfo = form.get("productinfo")?.trim() ?? "";
  const firstname = form.get("firstname")?.trim() ?? "";
  const email = form.get("email")?.trim() ?? "";
  const udf1 = form.get("udf1")?.trim() ?? "";
  const udf2 = form.get("udf2")?.trim() ?? "";
  const udf3 = form.get("udf3")?.trim() ?? "";
  const udf4 = form.get("udf4")?.trim() ?? "";
  const udf5 = form.get("udf5")?.trim() ?? "";

  if (!txnid || !key || !receivedHash) {
    return { ok: false, error: "Invalid PayU response." };
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber: txnid, paymentMethod: "online", paymentProvider: "PAYU" },
  });
  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  const company = await getPublicCompanySettings();
  const secrets = await getProviderSecretsFromDb();
  const creds = resolveProviderCredentials("PAYU", company, secrets);
  if (!creds || creds.provider !== "PAYU") {
    return { ok: false, error: "PayU is not configured.", publicToken: order.publicToken };
  }

  const additionalCharges = form.get("additionalCharges")?.trim() ?? "";
  if (additionalCharges) {
    return {
      ok: false,
      error: "Orders with additional charges require extended PayU hash handling.",
      publicToken: order.publicToken,
    };
  }

  const valid = payuVerifyResponseHash({
    salt: creds.secret,
    receivedHash,
    status,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
  });

  if (!valid) {
    return { ok: false, error: "PayU hash verification failed.", publicToken: order.publicToken };
  }

  if (status !== "success") {
    return { ok: false, error: `Payment status: ${status || "failed"}.`, publicToken: order.publicToken };
  }

  if (Math.abs(Number(amount) - order.grandTotal) > 0.02) {
    return { ok: false, error: "Amount mismatch.", publicToken: order.publicToken };
  }

  if (order.paymentStatus === "PAID") {
    return { ok: true, publicToken: order.publicToken };
  }
  if (order.paymentStatus !== "PENDING") {
    return { ok: false, error: "Order cannot be paid.", publicToken: order.publicToken };
  }

  const marked = await markOnlinePaymentPaid(order.publicToken);
  if (!marked.ok) {
    return { ok: false, error: marked.error ?? "Could not finalize order.", publicToken: order.publicToken };
  }
  return { ok: true, publicToken: order.publicToken };
}
