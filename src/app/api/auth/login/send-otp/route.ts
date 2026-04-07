import { API_MESSAGES } from "@/lib/api/api-messages";
import { apiError, apiSuccess } from "@/lib/api/http-responses";
import { isEmailOtpEnabled } from "@/lib/auth/email-otp-config";
import { createAndStoreOtp, loginOtpIdentifier } from "@/lib/auth/otp-verification-token";
import { verifyUserPassword } from "@/lib/auth/verify-user-password";
import { sendAuthOtpEmail } from "@/lib/email/send-auth-otp";

export async function POST(req: Request) {
  try {
    if (!isEmailOtpEnabled()) {
      return apiError(API_MESSAGES.AUTH.OTP_NOT_CONFIGURED, 503);
    }

    const body = await req.json();
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const email = emailRaw.toLowerCase();

    if (!email || !password) {
      return apiError(API_MESSAGES.AUTH.LOGIN_INVALID, 400);
    }

    const user = await verifyUserPassword(email, password);
    if (!user) {
      return apiError(API_MESSAGES.AUTH.LOGIN_INVALID, 401);
    }

    const otp = await createAndStoreOtp(loginOtpIdentifier(email));
    await sendAuthOtpEmail(email, otp, "login");

    return apiSuccess(
      { sent: true as const },
      API_MESSAGES.AUTH.OTP_SENT_LOGIN,
      200
    );
  } catch {
    return apiError(API_MESSAGES.COMMON.INTERNAL_ERROR, 500);
  }
}
