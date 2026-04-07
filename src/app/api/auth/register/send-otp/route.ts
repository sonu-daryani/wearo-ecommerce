import { API_MESSAGES } from "@/lib/api/api-messages";
import { apiError, apiSuccess } from "@/lib/api/http-responses";
import { isEmailOtpEnabled } from "@/lib/auth/email-otp-config";
import { createAndStoreOtp, signupOtpIdentifier } from "@/lib/auth/otp-verification-token";
import { sendAuthOtpEmail } from "@/lib/email/send-auth-otp";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!isEmailOtpEnabled()) {
      return apiError(API_MESSAGES.AUTH.OTP_NOT_CONFIGURED, 503);
    }

    const body = await req.json();
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email = emailRaw.toLowerCase();
    if (!email || !password || password.length < 8) {
      return apiError(API_MESSAGES.AUTH.REGISTER_INVALID, 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError(API_MESSAGES.AUTH.REGISTER_EXISTS, 409);
    }

    const otp = await createAndStoreOtp(signupOtpIdentifier(email));
    await sendAuthOtpEmail(email, otp, "signup");

    return apiSuccess(
      { sent: true as const },
      API_MESSAGES.AUTH.OTP_SENT_SIGNUP,
      200
    );
  } catch {
    return apiError(API_MESSAGES.COMMON.INTERNAL_ERROR, 500);
  }
}
