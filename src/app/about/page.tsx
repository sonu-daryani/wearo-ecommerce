import { MarketingLead } from "@/components/marketing/MarketingPage";
import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("about", {
    title: "About us",
    description: `Learn about ${SITE_NAME} — curated fashion for India, quality-first buying, and a smooth shopping experience.`,
  });
}

export default async function AboutPage() {
  return (
    <MarketingPageWithCms
      slug="about"
      title={`About ${SITE_NAME}`}
      breadcrumbCurrent="About"
      description="Fashion that fits your life — from casual weekdays to celebrations."
    >
      <MarketingLead>
        {SITE_NAME} is built for shoppers across India who want reliable quality, fair pricing, and
        styles they can wear with confidence — women, men, and kids.
      </MarketingLead>
      <p>
        We curate clothing and accessories with care: fabrics that feel good, fits that work in
        real life, and designs that stay wearable season after season. Our team works closely with
        trusted partners so you can shop once and come back knowing what to expect.
      </p>
      <h2>Our promise</h2>
      <ul>
        <li>Transparent product information and clear sizing guidance where available.</li>
        <li>Secure checkout with payment methods your store enables.</li>
        <li>
          Support when you need it — see <Link href="/support">Customer support</Link>.
        </li>
      </ul>
      <p>
        Ready to browse? <Link href="/shop">Explore the shop</Link> or read how we ship in{" "}
        <Link href="/delivery">Delivery details</Link>.
      </p>
    </MarketingPageWithCms>
  );
}
