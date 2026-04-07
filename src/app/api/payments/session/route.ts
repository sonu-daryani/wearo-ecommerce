import { API_MESSAGES } from "@/lib/api/api-messages";
import { apiError, apiSuccess } from "@/lib/api/http-responses";
import { originFromRequest } from "@/lib/http/origin-from-request";
import { createPaymentSessionForCheckoutIntent } from "@/lib/payments/create-payment-session";

export const dynamic = "force-dynamic";

type Body = { checkoutToken?: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return apiError(API_MESSAGES.COMMON.INVALID_JSON, 400);
  }

  const checkoutToken = body.checkoutToken?.trim();
  if (!checkoutToken) {
    return apiError("Missing checkout token.", 400);
  }

  const origin = originFromRequest(req);
  const result = await createPaymentSessionForCheckoutIntent(checkoutToken, origin);
  if (!result.ok) {
    return apiError(result.error, result.status);
  }

  return apiSuccess(result.payload, API_MESSAGES.PAYMENTS.SESSION_READY, 200);
}
