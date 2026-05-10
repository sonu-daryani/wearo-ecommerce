import { MarketingLead } from "@/components/marketing/MarketingPage";
import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("resources-ebooks", {
    title: "Free eBooks",
    description: `Downloadable guides and lookbooks from ${SITE_NAME}.`,
  });
}

export default async function ResourcesEbooksPage() {
  return (
    <MarketingPageWithCms
      slug="resources-ebooks"
      title="Free eBooks & guides"
      breadcrumbParent={{ label: "Resources", href: "/resources" }}
      breadcrumbCurrent="eBooks"
      description="Curated PDFs and seasonal guides — add your own files as your content programme grows."
    >
      <MarketingLead>
        We’re assembling bite-sized guides — capsule wardrobes, fabric care, and fit basics — for{" "}
        {SITE_NAME} shoppers.
      </MarketingLead>
      <p>
        New downloads will appear here first. Until then, explore styling ideas on our{" "}
        <Link href="/resources/blog">blog</Link> and video picks linked from the footer.
      </p>
    </MarketingPageWithCms>
  );
}
