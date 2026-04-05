import prisma from "@/lib/prisma";
import { decryptPaymentSecret } from "@/lib/payment-secrets-crypto";

const KEY = "default";

/** Decrypted provider API secrets from DB (never send to the browser). */
export async function getDecryptedProviderSecrets(): Promise<{
  stripeSecretKey: string | null;
  razorpayKeySecret: string | null;
  cashfreeClientSecret: string | null;
}> {
  const row = await prisma.companySettings.findUnique({ where: { key: KEY } });
  if (!row) {
    return { stripeSecretKey: null, razorpayKeySecret: null, cashfreeClientSecret: null };
  }
  return {
    stripeSecretKey: decryptPaymentSecret(row.stripeSecretEnc),
    razorpayKeySecret: decryptPaymentSecret(row.razorpaySecretEnc),
    cashfreeClientSecret: decryptPaymentSecret(row.cashfreeSecretEnc),
  };
}
