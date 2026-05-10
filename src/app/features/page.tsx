import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("features", {
    title: "Features",
    description: `What you get when you shop on ${SITE_NAME}: secure checkout, order tracking, and account tools.`,
  });
}

export default async function FeaturesPage() {
  return (
    <MarketingPageWithCms
      slug="features"
      title="Features"
      description={`Everything ${SITE_NAME} offers today — designed to make shopping simple and trustworthy.`}
    >
      <h2>Shopping</h2>
      <p>
        Browse by category and style filters on the <Link href="/shop">shop</Link>, view rich
        product pages with imagery and pricing, and move through checkout with clear steps.
      </p>
      <h2>Account & orders</h2>
      <p>
        Create an account to save your details and view orders in one place. Visit{" "}
        <Link href="/account">Your account</Link> after signing in to see history and confirmation
        references.
      </p>
      <h2>Payments</h2>
      <p>
        Pay using methods enabled for your market (cards, UPI, wallets, etc.). Details vary by
        store configuration — see <Link href="/help/payments">Payments help</Link>.
      </p>
      <h2>Need help?</h2>
      <p>
        Our <Link href="/support">support</Link> page lists how to reach us and typical response
        times.
      </p>
    </MarketingPageWithCms>
  );
}
