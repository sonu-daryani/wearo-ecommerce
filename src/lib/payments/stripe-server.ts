import Stripe from "stripe";

function stripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" });
}

/** Stripe Checkout uses smallest currency unit (e.g. paise, cents). */
export function amountToStripeUnit(amount: number, currencyCode: string): number {
  const c = currencyCode.toLowerCase();
  const zeroDecimal = new Set([
    "bif",
    "clp",
    "djf",
    "gnf",
    "jpy",
    "kmf",
    "krw",
    "mga",
    "pyg",
    "rwf",
    "ugx",
    "vnd",
    "vuv",
    "xaf",
    "xof",
    "xpf",
  ]);
  if (zeroDecimal.has(c)) return Math.round(amount);
  return Math.round(amount * 100);
}

export async function stripeCreateCheckoutSession(params: {
  orderNumber: string;
  publicToken: string;
  checkoutToken: string;
  customerEmail?: string;
  grandTotal: number;
  currencyCode: string;
  companyName: string;
  origin: string;
  stripeSecretKey: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const sk = params.stripeSecretKey.trim();
  if (!sk) {
    return { ok: false, error: "Stripe secret key is missing." };
  }
  const stripe = stripeClient(sk);

  const email = String(params.customerEmail ?? "").trim();
  const unitAmount = amountToStripeUnit(params.grandTotal, params.currencyCode);
  if (unitAmount < 1) {
    return { ok: false, error: "Order amount is too small for Stripe Checkout." };
  }

  const successUrl = `${params.origin}/checkout/payment-return?token=${encodeURIComponent(params.publicToken)}&provider=STRIPE&checkoutToken=${encodeURIComponent(params.checkoutToken)}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${params.origin}/checkout?payment=cancelled`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        publicToken: params.publicToken,
        orderNumber: params.orderNumber,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: params.currencyCode.toLowerCase(),
            unit_amount: unitAmount,
            product_data: {
              name: `Order ${params.orderNumber}`,
              description: params.companyName.slice(0, 120),
            },
          },
        },
      ],
    });

    if (!session.url) {
      return { ok: false, error: "Stripe did not return a checkout URL." };
    }
    return { ok: true, url: session.url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe Checkout failed.";
    return { ok: false, error: msg };
  }
}

export async function stripeVerifyCheckoutSession(params: {
  sessionId: string;
  publicToken: string;
  expectedAmount: number;
  currencyCode: string;
  stripeSecretKey: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const sk = params.stripeSecretKey.trim();
  if (!sk) {
    return { ok: false, error: "Stripe secret key is missing." };
  }
  const stripe = stripeClient(sk);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(params.sessionId);
  } catch {
    return { ok: false, error: "Could not retrieve Stripe session." };
  }

  if (session.metadata?.publicToken !== params.publicToken) {
    return { ok: false, error: "Stripe session does not match this order." };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, error: `Payment not completed (status: ${session.payment_status}).` };
  }

  const expectedTotal = amountToStripeUnit(params.expectedAmount, params.currencyCode);
  if (
    typeof session.amount_total === "number" &&
    session.amount_total > 0 &&
    session.amount_total !== expectedTotal
  ) {
    return { ok: false, error: "Paid amount does not match the order total." };
  }

  return { ok: true };
}
