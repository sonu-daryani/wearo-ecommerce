import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("careers", {
    title: "Careers",
    description: `Careers at ${SITE_NAME} — join our team building fashion commerce for India.`,
  });
}

export default async function CareersPage() {
  return (
    <MarketingPageWithCms
      slug="careers"
      title="Careers"
      description="We’re growing a thoughtful e-commerce experience for Indian shoppers."
    >
      <p>
        {SITE_NAME} brings together merchandising, technology, and customer experience. We look for
        people who care about quality, clarity, and respect for shoppers’ time and money.
      </p>
      <h2>Open roles</h2>
      <p>
        We post openings as they become available. For general interest, reach out via{" "}
        <Link href="/support">Customer support</Link> with “Careers” in the subject and your focus
        area (operations, tech, design, or merchandising).
      </p>
      <h2>What we value</h2>
      <ul>
        <li>Ownership and clear communication.</li>
        <li>Customer empathy — especially when things go wrong.</li>
        <li>Attention to detail in product and process.</li>
      </ul>
    </MarketingPageWithCms>
  );
}
