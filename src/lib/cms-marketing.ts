import prisma from "@/lib/prisma";

export type PublishedMarketingDoc = {
  title: string;
  summary: string | null;
  content: string;
};

/** Published CMS page for marketing routes — same DB as admin. */
export async function getPublishedMarketingPage(
  slug: string
): Promise<PublishedMarketingDoc | null> {
  const s = slug.trim().toLowerCase();
  if (!s) return null;

  const doc = await prisma.cmsDocument.findFirst({
    where: { slug: s, published: true },
    select: { title: true, summary: true, content: true },
  });

  if (!doc?.content?.trim()) return null;
  return doc;
}
