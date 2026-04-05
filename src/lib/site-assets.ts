import prisma from "@/lib/prisma";

/** Keys stored in CmsSiteAsset (and form field names). */
export const SITE_IMAGE_KEYS = [
  "hero-desktop",
  "hero-mobile",
  "dress-style-1",
  "dress-style-2",
  "dress-style-3",
  "dress-style-4",
] as const;

export type SiteImageKey = (typeof SITE_IMAGE_KEYS)[number];

const DEFAULT_URLS: Record<SiteImageKey, string> = {
  "hero-desktop": "/images/header-homepage.png",
  "hero-mobile": "/images/header-res-homepage.png",
  "dress-style-1": "/images/dress-style-1.png",
  "dress-style-2": "/images/dress-style-2.png",
  "dress-style-3": "/images/dress-style-3.png",
  "dress-style-4": "/images/dress-style-4.png",
};

export type HomepageVisuals = {
  heroDesktop: string;
  heroMobile: string;
  dressStyle: [string, string, string, string];
};

export async function getHomepageVisuals(): Promise<HomepageVisuals> {
  const rows = await prisma.cmsSiteAsset.findMany({
    where: { key: { in: [...SITE_IMAGE_KEYS] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.imageUrl]));

  const url = (k: SiteImageKey) => map.get(k)?.trim() || DEFAULT_URLS[k];

  return {
    heroDesktop: url("hero-desktop"),
    heroMobile: url("hero-mobile"),
    dressStyle: [
      url("dress-style-1"),
      url("dress-style-2"),
      url("dress-style-3"),
      url("dress-style-4"),
    ],
  };
}

export function defaultSiteImageUrl(key: SiteImageKey): string {
  return DEFAULT_URLS[key];
}
