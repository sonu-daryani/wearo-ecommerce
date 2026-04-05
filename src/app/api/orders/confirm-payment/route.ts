import { API_MESSAGES } from "@/lib/api/api-messages";
import { apiError, apiSuccess } from "@/lib/api/http-responses";
import { markOnlinePaymentPaid } from "@/lib/orders/create-order";

export const dynamic = "force-dynamic";

/**
 * Legacy: marks an online order paid without gateway verification.
 * Checkout uses POST /api/payments/session + /api/payments/verify per provider (Stripe, Razorpay, Cashfree).
 */
export async function POST(req: Request) {
  if (process.env.DISABLE_CLIENT_ORDER_PAYMENT_CONFIRM === "true") {
    return apiError(API_MESSAGES.PAYMENTS.LEGACY_CONFIRM_DISABLED, 403);
  }
  let body: { publicToken?: string };
  try {
    body = (await req.json()) as { publicToken?: string };
  } catch {
    return apiError(API_MESSAGES.COMMON.INVALID_JSON, 400);
  }

  const publicToken = body.publicToken?.trim();
  if (!publicToken) {
    return apiError(API_MESSAGES.PAYMENTS.MISSING_PUBLIC_TOKEN, 400);
  }

  const result = await markOnlinePaymentPaid(publicToken);
  if (!result.ok) {
    return apiError(result.error ?? API_MESSAGES.COMMON.INTERNAL_ERROR, 400);
  }

  return apiSuccess({ confirmed: true }, API_MESSAGES.PAYMENTS.LEGACY_CONFIRM_OK, 200);
}
