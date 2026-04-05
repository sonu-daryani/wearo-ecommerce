import { API_MESSAGES } from "@/lib/api/api-messages";
import { apiError, apiSuccess } from "@/lib/api/http-responses";
import { originFromRequest } from "@/lib/http/origin-from-request";
import { createPaymentSessionForPublicToken } from "@/lib/payments/create-payment-session";

export const dynamic = "force-dynamic";

type Body = { publicToken?: string };

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

  const origin = originFromRequest(req);
  const result = await createPaymentSessionForPublicToken(publicToken, origin);
  if (!result.ok) {
    return apiError(result.error, result.status);
  }

  return apiSuccess(result.payload, API_MESSAGES.PAYMENTS.SESSION_READY, 200);
}
