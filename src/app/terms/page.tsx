import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("terms", {
    title: "Terms & conditions",
    description: `Terms of use for shopping on ${SITE_DOMAIN}.`,
  });
}

export default async function TermsPage() {
  return (
    <MarketingPageWithCms
      slug="terms"
      title="Terms & conditions"
      breadcrumbCurrent="Terms"
      description="Please read these terms before using our website and placing orders."
    >
      <p className="text-sm text-black/50">Last updated: 10 May 2026</p>
      <h2>1. Agreement</h2>
      <p>
        By accessing {SITE_DOMAIN} (“Site”) or placing an order with {SITE_NAME}, you agree to
        these Terms and our <Link href="/privacy">Privacy policy</Link>.
      </p>
      <h2>2. Orders & pricing</h2>
      <p>
        Product descriptions and prices are shown in good faith; rare errors may occur. We reserve
        the right to cancel orders affected by manifest mistakes, stock issues, or suspected fraud,
        with a full refund where payment was captured.
      </p>
      <h2>3. Payment</h2>
      <p>
        Payments are processed through providers enabled for this store. You authorise charges for
        the total shown at checkout in the currency displayed.
      </p>
      <h2>4. Shipping</h2>
      <p>
        Delivery obligations follow our <Link href="/delivery">Delivery details</Link>. Risk of loss
        passes in line with carrier terms once goods leave our fulfilment partner unless applicable
        law says otherwise.
      </p>
      <h2>5. Returns & refunds</h2>
      <p>
        Return eligibility depends on product category and campaign rules displayed at purchase.
        Contact <Link href="/support">support</Link> with your order ID for assistance.
      </p>
      <h2>6. Limitation</h2>
      <p>
        To the extent permitted by law, {SITE_NAME} is not liable for indirect or consequential
        losses arising from use of the Site or delayed delivery due to events outside reasonable
        control.
      </p>
      <h2>7. Contact</h2>
      <p>
        Questions about these terms? Reach us via the channels on our{" "}
        <Link href="/support">support</Link> page.
      </p>
    </MarketingPageWithCms>
  );
}
