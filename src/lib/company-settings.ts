import { API_MESSAGES } from "@/lib/api/api-messages";
import { mergeCompanySettingsSecrets } from "@/lib/company-settings-secret-overlay";
import { isPaymentProviderId } from "@/lib/payments/types";
import prisma from "@/lib/prisma";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/site-config";
import type { CompanySettings } from "@prisma/client";

const KEY = "default";

export type PublicCompanySettings = {
  companyName: string;
  legalName: string | null;
  supportEmail: string | null;
  logoUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  currency: {
    code: string;
    symbol: string;
    locale: string;
    decimalPlaces: number;
  };
  checkout: {
    codAvailable: boolean;
    onlineAvailable: boolean;
    codFeeFlat: number;
    codFeePercent: number;
    codWaiveFeeAboveAmount: number | null;
    onlineChannels: {
      upi: boolean;
      card: boolean;
      wallet: boolean;
      netBanking: boolean;
    };
    onlineProviders: string[];
  };
  cashfreeAppId: string | null;
  /** Per-provider: publishable/app id + secret saved in company settings (same DB). */
  paymentProviderReadiness: {
    CASHFREE: boolean;
    RAZORPAY: boolean;
    PAYTM: boolean;
    PHONEPE: boolean;
    PAYU: boolean;
  };
  paymentInstructions: string | null;
  /** Checkout copy from server (`api-messages.ts`); use for client-side toasts before POST. */
  checkoutUi: typeof API_MESSAGES.CHECKOUT_UI;
  theme: Record<string, string> | null;
};

function mapRow(row: CompanySettings) {
  const onlineProviders = (row.onlineProviders ?? []).filter(isPaymentProviderId);
  const themeRaw = (row as unknown as { theme?: unknown }).theme;
  const typeCod = row.payTypeCodSelected ?? true;
  const typeOnline = row.payTypeOnlineSelected ?? true;
  const codAvailable = typeCod && row.payCod;
  const onlineAvailable = typeOnline && (row.payOnlineEnabled ?? false);

  return {
    companyName: row.companyName,
    legalName: row.legalName,
    supportEmail: row.supportEmail,
    logoUrl: row.logoUrl,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    ogImageUrl: row.ogImageUrl,
    currency: {
      code: row.currencyCode,
      symbol: row.currencySymbol,
      locale: row.currencyLocale,
      decimalPlaces: row.currencyDecimalPlaces,
    },
    checkout: {
      codAvailable,
      onlineAvailable,
      codFeeFlat: row.codFeeFlat ?? 0,
      codFeePercent: row.codFeePercent ?? 0,
      codWaiveFeeAboveAmount: row.codWaiveFeeAboveAmount ?? null,
      onlineChannels: {
        upi: row.payUpi,
        card: row.payCard,
        wallet: row.payWallet,
        netBanking: row.payNetBanking,
      },
      onlineProviders,
    },
    cashfreeAppId: row.cashfreeAppId ?? null,
    paymentProviderReadiness: {
      CASHFREE: !!(row.cashfreeAppId?.trim() && row.cashfreeClientSecret?.trim()),
      RAZORPAY: !!(row.razorpayKeyId?.trim() && row.razorpayKeySecret?.trim()),
      PAYTM: !!(row.paytmMerchantId?.trim() && row.paytmMerchantKey?.trim()),
      PHONEPE: !!(row.phonepeMerchantId?.trim() && row.phonepeSaltKey?.trim()),
      PAYU: !!(row.payuMerchantKey?.trim() && row.payuSalt?.trim()),
    },
    paymentInstructions: row.paymentInstructions,
    checkoutUi: API_MESSAGES.CHECKOUT_UI,
    theme:
      themeRaw && typeof themeRaw === "object" && !Array.isArray(themeRaw)
        ? (themeRaw as Record<string, string>)
        : null,
  } satisfies PublicCompanySettings;
}

const FALLBACK: PublicCompanySettings = {
  companyName: SITE_NAME,
  legalName: null,
  supportEmail: null,
  logoUrl: null,
  metaTitle: `${SITE_NAME}`,
  metaDescription: DEFAULT_DESCRIPTION,
  ogImageUrl: null,
  currency: {
    code: "USD",
    symbol: "$",
    locale: "en-IN",
    decimalPlaces: 2,
  },
  checkout: {
    codAvailable: true,
    onlineAvailable: false,
    codFeeFlat: 0,
    codFeePercent: 0,
    codWaiveFeeAboveAmount: null,
    onlineChannels: {
      upi: false,
      card: false,
      wallet: false,
      netBanking: false,
    },
    onlineProviders: [],
  },
  cashfreeAppId: null,
  paymentProviderReadiness: {
    CASHFREE: false,
    RAZORPAY: false,
    PAYTM: false,
    PHONEPE: false,
    PAYU: false,
  },
  paymentInstructions: null,
  checkoutUi: API_MESSAGES.CHECKOUT_UI,
  theme: null,
};

/** Map `content.*` theme keys to `data-editor-key` ids for SSR text. */
export function themeContentMap(
  theme: Record<string, string> | null | undefined
): Record<string, string> {
  if (!theme) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(theme)) {
    if (!k.startsWith("content.") || typeof v !== "string") continue;
    const t = v.trim();
    if (!t) continue;
    out[k.slice("content.".length)] = t;
  }
  return out;
}

/** Public-safe payload for the storefront (and JSON API). */
export async function getPublicCompanySettings(): Promise<PublicCompanySettings> {
  const row = await prisma.companySettings.findUnique({ where: { key: KEY } });
  if (!row) return FALLBACK;
  const merged = await mergeCompanySettingsSecrets(row);
  return mapRow(merged);
}
