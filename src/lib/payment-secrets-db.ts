import { mergeCompanySettingsSecrets } from "@/lib/company-settings-secret-overlay";
import prisma from "@/lib/prisma";

const KEY = "default";

/** Provider API secrets from DB (never send to the browser). */
export async function getProviderSecretsFromDb(): Promise<{
  cashfreeClientSecret: string | null;
  razorpayKeyId: string | null;
  razorpayKeySecret: string | null;
  paytmMerchantId: string | null;
  paytmMerchantKey: string | null;
  phonepeMerchantId: string | null;
  phonepeSaltKey: string | null;
  payuMerchantKey: string | null;
  payuSalt: string | null;
}> {
  const row = await prisma.companySettings.findUnique({ where: { key: KEY } });
  if (!row) {
    return {
      cashfreeClientSecret: null,
      razorpayKeyId: null,
      razorpayKeySecret: null,
      paytmMerchantId: null,
      paytmMerchantKey: null,
      phonepeMerchantId: null,
      phonepeSaltKey: null,
      payuMerchantKey: null,
      payuSalt: null,
    };
  }
  const merged = await mergeCompanySettingsSecrets(row);
  return {
    cashfreeClientSecret: merged.cashfreeClientSecret?.trim() ?? null,
    razorpayKeyId: merged.razorpayKeyId?.trim() ?? null,
    razorpayKeySecret: merged.razorpayKeySecret?.trim() ?? null,
    paytmMerchantId: merged.paytmMerchantId?.trim() ?? null,
    paytmMerchantKey: merged.paytmMerchantKey?.trim() ?? null,
    phonepeMerchantId: merged.phonepeMerchantId?.trim() ?? null,
    phonepeSaltKey: merged.phonepeSaltKey?.trim() ?? null,
    payuMerchantKey: merged.payuMerchantKey?.trim() ?? null,
    payuSalt: merged.payuSalt?.trim() ?? null,
  };
}
