import type { PublicCompanySettings } from "@/lib/company-settings";

type ProviderSecrets = {
  cashfreeClientSecret: string | null;
  razorpayKeyId: string | null;
  razorpayKeySecret: string | null;
  paytmMerchantId: string | null;
  paytmMerchantKey: string | null;
  phonepeMerchantId: string | null;
  phonepeSaltKey: string | null;
  payuMerchantKey: string | null;
  payuSalt: string | null;
};

export type ProviderCredentials =
  | { provider: "CASHFREE"; id: string; secret: string }
  | { provider: "RAZORPAY"; id: string; secret: string }
  | { provider: "PAYTM"; id: string; secret: string }
  | { provider: "PHONEPE"; id: string; secret: string }
  | { provider: "PAYU"; id: string; secret: string };

/**
 * Shared provider credential resolver so payment flows don't hardcode
 * secret/id lookup in multiple places.
 */
export function resolveProviderCredentials(
  provider: "CASHFREE" | "RAZORPAY" | "PAYTM" | "PHONEPE" | "PAYU",
  company: PublicCompanySettings,
  secrets: ProviderSecrets
): ProviderCredentials | null {
  if (provider === "CASHFREE") {
    const id = company.cashfreeAppId?.trim() ?? "";
    const secret = secrets.cashfreeClientSecret?.trim() ?? "";
    if (!id || !secret) return null;
    return { provider, id, secret };
  }

  if (provider === "RAZORPAY") {
    const id = secrets.razorpayKeyId?.trim() ?? "";
    const secret = secrets.razorpayKeySecret?.trim() ?? "";
    if (!id || !secret) return null;
    return { provider, id, secret };
  }

  if (provider === "PAYTM") {
    const id = secrets.paytmMerchantId?.trim() ?? "";
    const secret = secrets.paytmMerchantKey?.trim() ?? "";
    if (!id || !secret) return null;
    return { provider, id, secret };
  }

  if (provider === "PHONEPE") {
    const id = secrets.phonepeMerchantId?.trim() ?? "";
    const secret = secrets.phonepeSaltKey?.trim() ?? "";
    if (!id || !secret) return null;
    return { provider, id, secret };
  }

  const id = secrets.payuMerchantKey?.trim() ?? "";
  const secret = secrets.payuSalt?.trim() ?? "";
  if (!id || !secret) return null;
  return { provider, id, secret };
}
