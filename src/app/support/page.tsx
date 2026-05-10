import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("support", {
    title: "Customer support",
    description: `Get help with orders, returns, and shopping on ${SITE_DOMAIN}.`,
  });
}

export default async function SupportPage() {
  return (
    <MarketingPageWithCms
      slug="support"
      title="Customer support"
      breadcrumbCurrent="Support"
      description={`We’re here to help you shop confidently on ${SITE_NAME}.`}
    >
      <h2>Before you write in</h2>
      <ul>
        <li>
          <Link href="/help/orders">Orders</Link> — confirmations, timelines, and changes.
        </li>
        <li>
          <Link href="/delivery">Delivery</Link> — shipping regions and tracking.
        </li>
        <li>
          <Link href="/help/payments">Payments</Link> — failed payments and receipts.
        </li>
      </ul>
      <h2>Contact</h2>
      <p>
        Email is the primary channel for this storefront deployment. Use the contact address or form
        your team configures for production (e.g. support@{SITE_DOMAIN.toLowerCase()}).
      </p>
      <p className="rounded-xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/70">
        <strong className="text-black">Tip:</strong> Include your order ID or registered email so
        we can resolve issues faster.
      </p>
      <h2>Response times</h2>
      <p>
        We aim to reply within 1–2 business days. Peak sale periods may take a little longer — thank
        you for your patience.
      </p>
    </MarketingPageWithCms>
  );
}
