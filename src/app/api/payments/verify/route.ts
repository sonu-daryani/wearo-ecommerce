import { API_MESSAGES } from "@/lib/api/api-messages";
import { apiError, apiSuccess } from "@/lib/api/http-responses";
import { verifyOnlinePayment } from "@/lib/payments/verify-payment";

export const dynamic = "force-dynamic";

type Body = {
  checkoutToken?: string;
  publicToken?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return apiError(API_MESSAGES.COMMON.INVALID_JSON, 400);
  }

  const checkoutToken = body.checkoutToken?.trim();
  const publicToken = body.publicToken?.trim();
  if (!checkoutToken && !publicToken) {
    return apiError("Missing checkout token or public token.", 400);
  }

  const result = await verifyOnlinePayment({
    checkoutToken,
    publicToken,
    razorpayPaymentId: body.razorpayPaymentId,
    razorpayOrderId: body.razorpayOrderId,
    razorpaySignature: body.razorpaySignature,
  });

  if (!result.ok) {
    return apiError(result.error ?? API_MESSAGES.PAYMENTS.VERIFY_FAILED_GENERIC, result.status);
  }

  return apiSuccess({ verified: true, paid: result.paid }, API_MESSAGES.PAYMENTS.VERIFY_SUCCESS, 200);
}
