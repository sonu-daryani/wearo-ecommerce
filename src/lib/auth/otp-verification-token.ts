import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const OTP_TTL_MS = 10 * 60 * 1000;

const SIGNUP_PREFIX = "otp-signup:";
const LOGIN_PREFIX = "otp-login:";

export function signupOtpIdentifier(email: string): string {
  return `${SIGNUP_PREFIX}${email.toLowerCase()}`;
}

export function loginOtpIdentifier(email: string): string {
  return `${LOGIN_PREFIX}${email.toLowerCase()}`;
}

export async function createAndStoreOtp(identifier: string): Promise<string> {
  const otp = crypto.randomInt(100000, 1000000).toString();
  const hash = await bcrypt.hash(otp, 10);
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hash,
      expires: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  return otp;
}

export async function verifyOtpAndConsume(
  identifier: string,
  plainOtp: string
): Promise<boolean> {
  const trimmed = plainOtp.trim();
  if (!/^\d{6}$/.test(trimmed)) return false;

  const rows = await prisma.verificationToken.findMany({
    where: { identifier, expires: { gt: new Date() } },
  });
  for (const row of rows) {
    const ok = await bcrypt.compare(trimmed, row.token);
    if (ok) {
      await prisma.verificationToken.deleteMany({ where: { identifier } });
      return true;
    }
  }
  return false;
}
