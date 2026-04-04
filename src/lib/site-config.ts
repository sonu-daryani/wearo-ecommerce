import type { Metadata } from "next";

export const SITE_NAME = "Wearo India";
export const SITE_DOMAIN = "Wearo.in";
export const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_DOMAIN}`;
export const DEFAULT_DESCRIPTION =
  "Discover curated clothing and accessories for men, women, and kids across India. Quality fashion, fair prices, and a smooth shopping experience on Wearo.in.";

const CATEGORY_LABELS: Record<string, string> = {
  "t-shirts": "T-Shirts",
  shorts: "Shorts",
  shirts: "Shirts",
  hoodie: "Hoodies",
  jeans: "Jeans",
};

const STYLE_LABELS: Record<string, string> = {
  casual: "Casual",
  formal: "Formal",
  party: "Party",
  gym: "Gym",
};

export function getMetadataBase(): URL {
  const explicit = process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    try {
      const u = explicit.replace(/\/$/, "");
      return new URL(u);
    } catch {
      /* continue */
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("http://localhost:3000");
}

export function absoluteUrl(path: string): string {
  const origin = getMetadataBase().origin;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

export function formatCategoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatStyleLabel(slug: string): string {
  return STYLE_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function buildShopTitle(category?: string | null, style?: string | null): string {
  if (category && style) {
    return `${formatCategoryLabel(category)} · ${formatStyleLabel(style)}`;
  }
  if (category) {
    return `${formatCategoryLabel(category)}`;
  }
  if (style) {
    return `${formatStyleLabel(style)} styles`;
  }
  return "Shop all fashion";
}

export function buildShopDescription(
  category?: string | null,
  style?: string | null
): string {
  if (category && style) {
    return `Browse ${formatCategoryLabel(category)} in ${formatStyleLabel(style)} style at ${SITE_NAME}. Premium picks shipped across India.`;
  }
  if (category) {
    return `Shop ${formatCategoryLabel(category)} online at ${SITE_NAME}. New arrivals, trusted quality, delivery across India.`;
  }
  if (style) {
    return `Explore ${formatStyleLabel(style)} fashion for every occasion on ${SITE_DOMAIN}. Curated by ${SITE_NAME}.`;
  }
  return DEFAULT_DESCRIPTION;
}

export const defaultOpenGraph: Metadata["openGraph"] = {
  type: "website",
  locale: "en_IN",
  siteName: SITE_NAME,
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
};

export const defaultTwitter: Metadata["twitter"] = {
  card: "summary_large_image",
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
};
