import type { Metadata } from "next";
import { getPublishedMarketingPage } from "./cms-marketing";

/** Use CMS title/summary for meta when a published body exists; otherwise static fallback. */
export async function marketingMetadata(slug: string, fallback: Metadata): Promise<Metadata> {
  const cms = await getPublishedMarketingPage(slug);
  if (!cms?.content?.trim()) return fallback;

  const description =
    cms.summary ??
    (typeof fallback.description === "string" ? fallback.description : undefined);

  return {
    ...fallback,
    title: cms.title,
    ...(description ? { description } : {}),
  };
}
