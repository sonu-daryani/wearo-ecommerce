import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("resources-blog", {
    title: "Blog",
    description: `News, style notes, and how-tos from ${SITE_NAME}.`,
  });
}

export default async function ResourcesBlogPage() {
  return (
    <MarketingPageWithCms
      slug="resources-blog"
      title="Blog"
      breadcrumbParent={{ label: "Resources", href: "/resources" }}
      description="Stories from our team — launches, fabric notes, and seasonal edits."
    >
      <p>
        We’ll publish posts here as your content pipeline grows. For now, explore{" "}
        <Link href="/shop">new arrivals</Link>, <Link href="/delivery">delivery</Link>, and{" "}
        <Link href="/support">support</Link> for shopping questions.
      </p>
      <p className="rounded-xl border border-dashed border-black/15 bg-black/[0.02] p-6 text-center text-black/60">
        No articles yet — connect a CMS or markdown workflow when you’re ready to scale{" "}
        {SITE_NAME} editorial.
      </p>
    </MarketingPageWithCms>
  );
}
