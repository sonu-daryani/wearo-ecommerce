import type { CompanySettings } from "@prisma/client";
import prisma from "@/lib/prisma";

const KEY = "default";

type SecretOverlay = {
  stripeSecretKey: string | null;
  razorpayKeySecret: string | null;
  cashfreeClientSecret: string | null;
};

function parseFindRawFirstDoc(raw: unknown): Record<string, unknown> | null {
  if (Array.isArray(raw) && raw.length > 0 && raw[0] && typeof raw[0] === "object") {
    return raw[0] as Record<string, unknown>;
  }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return null;
}

function strField(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

/**
 * Reads secret columns via Mongo `findRaw`. Use when `findUnique` returns null for secrets
 * even though the document has them (seen on some Prisma + MongoDB deployments).
 */
async function loadSecretOverlay(): Promise<SecretOverlay> {
  try {
    const raw = await prisma.companySettings.findRaw({
      filter: { key: KEY },
      options: {
        projection: {
          stripeSecretKey: true,
          razorpayKeySecret: true,
          cashfreeClientSecret: true,
        },
        limit: 1,
      },
    });
    const doc = parseFindRawFirstDoc(raw);
    if (!doc) {
      return { stripeSecretKey: null, razorpayKeySecret: null, cashfreeClientSecret: null };
    }
    return {
      stripeSecretKey: strField(doc.stripeSecretKey),
      razorpayKeySecret: strField(doc.razorpayKeySecret),
      cashfreeClientSecret: strField(doc.cashfreeClientSecret),
    };
  } catch {
    return { stripeSecretKey: null, razorpayKeySecret: null, cashfreeClientSecret: null };
  }
}

function needsSecretOverlay(row: CompanySettings): boolean {
  return (
    (!!row.cashfreeAppId?.trim() && !row.cashfreeClientSecret?.trim()) ||
    (!!row.stripePublishableKey?.trim() && !row.stripeSecretKey?.trim()) ||
    (!!row.razorpayKeyId?.trim() && !row.razorpayKeySecret?.trim())
  );
}

/**
 * Returns a row-shaped object with payment secret fields filled from `findRaw` when ORM left them empty.
 */
export async function mergeCompanySettingsSecrets(row: CompanySettings): Promise<CompanySettings> {
  if (!needsSecretOverlay(row)) return row;
  const o = await loadSecretOverlay();
  return {
    ...row,
    stripeSecretKey: row.stripeSecretKey?.trim() || o.stripeSecretKey,
    razorpayKeySecret: row.razorpayKeySecret?.trim() || o.razorpayKeySecret,
    cashfreeClientSecret: row.cashfreeClientSecret?.trim() || o.cashfreeClientSecret,
  };
}
