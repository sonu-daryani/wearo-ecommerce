import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("help-orders", {
    title: "Orders help",
    description: `Order confirmations, changes, and cancellations on ${SITE_NAME}.`,
  });
}

export default async function HelpOrdersPage() {
  return (
    <MarketingPageWithCms
      slug="help-orders"
      title="Orders help"
      breadcrumbParent={{ label: "Help", href: "/support" }}
      breadcrumbCurrent="Orders"
      description="Everything about placing and managing orders."
    >
      <h2>Confirmation</h2>
      <p>
        After payment succeeds, you should receive an order confirmation by email. Keep that email
        — it contains references our team uses to help you.
      </p>
      <h2>View orders online</h2>
      <p>
        Sign in and open <Link href="/account">Your account</Link> to see orders linked to your
        profile when available.
      </p>
      <h2>Changes & cancellations</h2>
      <p>
        Whether an order can be changed depends on fulfilment status. Contact{" "}
        <Link href="/support">support</Link> as early as possible with your order ID.
      </p>
      <h2>Wrong item or quantity</h2>
      <p>
        Tell us within the timeframe stated in your confirmation or campaign terms. Photos help us
        resolve issues faster.
      </p>
    </MarketingPageWithCms>
  );
}
