import { MarketingPage } from "@/components/marketing/MarketingPage";
import { SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payments help",
  description: `Paying securely on ${SITE_NAME} — cards, UPI, wallets, and failed payments.`,
};

export default function HelpPaymentsPage() {
  return (
    <MarketingPage
      title="Payments help"
      breadcrumbParent={{ label: "Help", href: "/support" }}
      breadcrumbCurrent="Payments"
      description="How checkout payments work and what to do when something fails."
    >
      <h2>Methods</h2>
      <p>
        Available options (cards, UPI, netbanking, wallets, etc.) appear at checkout based on your
        device, bank, and what the store has enabled.
      </p>
      <h2>Security</h2>
      <p>
        Sensitive card data is handled by certified payment partners; {SITE_NAME} does not store
        full card numbers on our application servers.
      </p>
      <h2>Failed or pending payments</h2>
      <p>
        If money left your account but the order did not confirm, wait a few minutes for automatic
        reconciliation. If the issue persists, email{" "}
        <Link href="/support">support</Link> with time of attempt and payment reference from your
        bank or UPI app.
      </p>
      <h2>Refunds</h2>
      <p>
        Approved refunds return to the original payment method where possible; bank timelines vary.
      </p>
    </MarketingPage>
  );
}
