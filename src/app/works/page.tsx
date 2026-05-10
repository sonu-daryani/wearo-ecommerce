import { MarketingPage } from "@/components/marketing/MarketingPage";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description: `How shopping on ${SITE_NAME} works — from browsing to delivery.`,
};

export default function WorksPage() {
  return (
    <MarketingPage
      title="How it works"
      breadcrumbCurrent="Works"
      description="From discovering styles to receiving your order — here’s the journey."
    >
      <h2>1. Browse & choose</h2>
      <p>
        Explore collections on the <Link href="/shop">shop</Link>, open products you like, and add
        them to your bag. Adjust sizes and quantities before checkout.
      </p>
      <h2>2. Checkout securely</h2>
      <p>
        Enter shipping details and pay with an available method. You’ll see confirmation on-screen
        and receive details by email where configured.
      </p>
      <h2>3. We prepare & ship</h2>
      <p>
        Orders are processed and handed to our logistics partners. Timelines depend on your
        location — see <Link href="/delivery">Delivery details</Link>.
      </p>
      <h2>4. Track & enjoy</h2>
      <p>
        Use your order confirmation and account area where available. Questions?{" "}
        <Link href="/support">Contact support</Link>.
      </p>
    </MarketingPage>
  );
}
