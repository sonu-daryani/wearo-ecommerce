import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("delivery", {
    title: "Delivery details",
    description: `Shipping regions, timelines, and tracking for ${SITE_NAME} orders across India.`,
  });
}

export default async function DeliveryPage() {
  return (
    <MarketingPageWithCms
      slug="delivery"
      title="Delivery details"
      breadcrumbCurrent="Delivery"
      description="Where we ship, how long it usually takes, and how to follow your parcel."
    >
      <h2>Coverage</h2>
      <p>
        We ship to serviceable pin codes across India. Availability is confirmed at checkout based
        on your address and carrier capacity.
      </p>
      <h2>Timelines</h2>
      <p>
        Standard orders typically dispatch within 1–3 business days unless stated otherwise on the
        product page. Transit time depends on your city and courier — metro areas are often faster;
        remote locations may take longer.
      </p>
      <h2>Fees</h2>
      <p>
        Shipping charges (if any) appear clearly before you pay. Free-shipping promotions apply
        only when shown at checkout.
      </p>
      <section id="tracking" className="scroll-mt-28">
        <h2>Manage deliveries & tracking</h2>
        <p>
          After checkout you receive a confirmation email with order reference. When your package
          ships, tracking information may be included where carriers support it.
        </p>
        <p>
          Signed-in shoppers can review orders under <Link href="/account">Your account</Link>.
          You can also use the secure link from your confirmation email.
        </p>
      </section>
      <h2>Issues</h2>
      <p>
        Wrong address, delayed parcel, or damaged package?{" "}
        <Link href="/support">Contact support</Link> with your order ID.
      </p>
    </MarketingPageWithCms>
  );
}
