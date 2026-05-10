import { MarketingLead, MarketingPage } from "@/components/marketing/MarketingPage";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free eBooks",
  description: `Downloadable guides and lookbooks from ${SITE_NAME}.`,
};

export default function ResourcesEbooksPage() {
  return (
    <MarketingPage
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
    </MarketingPage>
  );
}
