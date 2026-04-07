import nodemailer from "nodemailer";
import { getSmtpOtpConfig } from "@/lib/auth/email-otp-config";

export async function sendAuthOtpEmail(
  to: string,
  code: string,
  purpose: "signup" | "login"
): Promise<void> {
  const cfg = getSmtpOtpConfig();
  if (!cfg) {
    throw new Error("SMTP is not configured for OTP email");
  }

  const subject =
    purpose === "signup"
      ? "Verify your Wearo account"
      : "Your Wearo sign-in code";

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  await transporter.sendMail({
    from: cfg.from,
    to,
    subject,
    html: `<p style="font-size:16px;font-family:sans-serif;">Your one-time code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:0.2em;font-family:monospace;">${code}</p><p style="font-size:14px;color:#666;">It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
  });
}
