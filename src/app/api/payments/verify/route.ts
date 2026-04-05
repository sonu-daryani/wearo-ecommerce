import { API_MESSAGES } from "@/lib/api/api-messages";
import { apiError, apiSuccess } from "@/lib/api/http-responses";
import { verifyOnlinePayment } from "@/lib/payments/verify-payment";

export const dynamic = "force-dynamic";

type Body = {
  publicToken?: string;
  stripeSessionId?: string | null;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  razorpaySignature?: string | null;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return apiError(API_MESSAGES.COMMON.INVALID_JSON, 400);
  }

  const publicToken = body.publicToken?.trim();
  if (!publicToken) {
    return apiError(API_MESSAGES.PAYMENTS.MISSING_PUBLIC_TOKEN, 400);
  }

  const result = await verifyOnlinePayment({
    publicToken,
    stripeSessionId: body.stripeSessionId,
    razorpayPaymentId: body.razorpayPaymentId,
    razorpayOrderId: body.razorpayOrderId,
    razorpaySignature: body.razorpaySignature,
  });

  if (!result.ok) {
    return apiError(result.error ?? API_MESSAGES.PAYMENTS.VERIFY_FAILED_GENERIC, result.status);
  }

  return apiSuccess({ verified: true }, API_MESSAGES.PAYMENTS.VERIFY_SUCCESS, 200);
}
