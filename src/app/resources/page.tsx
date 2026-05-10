import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("resources", {
    title: "Resources",
    description: `Guides, tutorials, and articles from ${SITE_NAME}.`,
  });
}

export default async function ResourcesIndexPage() {
  return (
    <MarketingPageWithCms
      slug="resources"
      title="Resources"
      description="Learn, browse deeper, and get inspired beyond the catalogue."
    >
      <ul className="list-none space-y-4 pl-0">
        <li className="rounded-xl border border-black/10 bg-black/[0.02] p-5">
          <Link href="/resources/ebooks" className="no-underline hover:no-underline">
            <span className="block text-lg font-semibold text-black">Free eBooks & guides</span>
            <span className="mt-1 block text-sm font-normal text-black/60">
              PDFs and seasonal lookbooks.
            </span>
          </Link>
        </li>
        <li className="rounded-xl border border-black/10 bg-black/[0.02] p-5">
          <Link href="/resources/tutorials" className="no-underline hover:no-underline">
            <span className="block text-lg font-semibold text-black">Tutorials</span>
            <span className="mt-1 block text-sm font-normal text-black/60">
              Step-by-step tips for shopping and care.
            </span>
          </Link>
        </li>
        <li className="rounded-xl border border-black/10 bg-black/[0.02] p-5">
          <Link href="/resources/blog" className="no-underline hover:no-underline">
            <span className="block text-lg font-semibold text-black">Blog</span>
            <span className="mt-1 block text-sm font-normal text-black/60">
              Stories, trends, and how-tos.
            </span>
          </Link>
        </li>
      </ul>
    </MarketingPageWithCms>
  );
}
