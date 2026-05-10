import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("resources-tutorials", {
    title: "Tutorials",
    description: "Step-by-step tutorials for shopping, sizing, and garment care.",
  });
}

export default async function ResourcesTutorialsPage() {
  return (
    <MarketingPageWithCms
      slug="resources-tutorials"
      title="Tutorials"
      breadcrumbParent={{ label: "Resources", href: "/resources" }}
      breadcrumbCurrent="Tutorials"
      description="Practical walkthroughs — from choosing a size to caring for fabrics."
    >
      <h2>Shopping smarter</h2>
      <ul>
        <li>Use filters on the shop to narrow by category and style.</li>
        <li>Read fabric notes on product pages before you buy.</li>
        <li>
          Save your shipping details in <Link href="/account">your account</Link> for faster
          checkout.
        </li>
      </ul>
      <h2>Caring for your clothes</h2>
      <p>
        Follow wash labels, separate colours for the first wash, and air-dry delicate knits where
        recommended.
      </p>
      <p>
        More articles will live under our <Link href="/resources/blog">blog</Link> as we publish.
      </p>
    </MarketingPageWithCms>
  );
}
