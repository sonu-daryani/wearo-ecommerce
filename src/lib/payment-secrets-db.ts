import { mergeCompanySettingsSecrets } from "@/lib/company-settings-secret-overlay";
import prisma from "@/lib/prisma";

const KEY = "default";

/** Provider API secrets from DB (never send to the browser). */
export async function getProviderSecretsFromDb(): Promise<{
  stripeSecretKey: string | null;
  razorpayKeySecret: string | null;
  cashfreeClientSecret: string | null;
}> {
  const row = await prisma.companySettings.findUnique({ where: { key: KEY } });
  if (!row) {
    return { stripeSecretKey: null, razorpayKeySecret: null, cashfreeClientSecret: null };
  }
  const merged = await mergeCompanySettingsSecrets(row);
  return {
    stripeSecretKey: merged.stripeSecretKey?.trim() ?? null,
    razorpayKeySecret: merged.razorpayKeySecret?.trim() ?? null,
    cashfreeClientSecret: merged.cashfreeClientSecret?.trim() ?? null,
  };
}
