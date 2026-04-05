import { API_MESSAGES } from "@/lib/api/api-messages";
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
  stripePublishableKey: string | null;
  razorpayKeyId: string | null;
  cashfreeAppId: string | null;
  /** Per-provider: CMS key present + matching secret env on this server (see .env.example). */
  paymentProviderReadiness: {
    STRIPE: boolean;
    RAZORPAY: boolean;
    CASHFREE: boolean;
  };
  paymentInstructions: string | null;
  /** Checkout copy from server (`api-messages.ts`); use for client-side toasts before POST. */
  checkoutUi: typeof API_MESSAGES.CHECKOUT_UI;
};

function mapRow(row: CompanySettings) {
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
      onlineProviders: row.onlineProviders ?? [],
    },
    stripePublishableKey: row.stripePublishableKey,
    razorpayKeyId: row.razorpayKeyId,
    cashfreeAppId: row.cashfreeAppId ?? null,
    paymentProviderReadiness: {
      STRIPE: !!(row.stripePublishableKey?.trim() && row.stripeSecretEnc?.trim()),
      RAZORPAY: !!(row.razorpayKeyId?.trim() && row.razorpaySecretEnc?.trim()),
      CASHFREE: !!(row.cashfreeAppId?.trim() && row.cashfreeSecretEnc?.trim()),
    },
    paymentInstructions: row.paymentInstructions,
    checkoutUi: API_MESSAGES.CHECKOUT_UI,
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
  stripePublishableKey: null,
  razorpayKeyId: null,
  cashfreeAppId: null,
  paymentProviderReadiness: {
    STRIPE: false,
    RAZORPAY: false,
    CASHFREE: false,
  },
  paymentInstructions: null,
  checkoutUi: API_MESSAGES.CHECKOUT_UI,
};

/** Public-safe payload for the storefront (and JSON API). */
export async function getPublicCompanySettings(): Promise<PublicCompanySettings> {
  const row = await prisma.companySettings.findUnique({ where: { key: KEY } });
  if (!row) return FALLBACK;
  return mapRow(row);
}
