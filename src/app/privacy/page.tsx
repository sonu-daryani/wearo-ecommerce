import { MarketingPageWithCms } from "@/components/marketing/MarketingPageWithCms";
import { marketingMetadata } from "@/lib/cms-marketing-metadata";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata("privacy", {
    title: "Privacy policy",
    description: `How ${SITE_NAME} collects, uses, and protects your personal data.`,
  });
}

export default async function PrivacyPage() {
  return (
    <MarketingPageWithCms
      slug="privacy"
      title="Privacy policy"
      breadcrumbCurrent="Privacy"
      description="Your privacy matters. This page summarises how we handle personal information."
    >
      <p className="text-sm text-black/50">Last updated: 10 May 2026</p>
      <h2>1. Who we are</h2>
      <p>
        This policy applies to {SITE_NAME} operating {SITE_DOMAIN} (the “Site”).
      </p>
      <h2>2. Data we collect</h2>
      <ul>
        <li>
          <strong>Account & orders:</strong> name, email, phone, shipping address, order history.
        </li>
        <li>
          <strong>Payments:</strong> processed by payment partners; we do not store full card numbers
          on our servers.
        </li>
        <li>
          <strong>Technical:</strong> cookies and similar technologies needed for sign-in, cart,
          and security (see your browser settings).
        </li>
      </ul>
      <h2>3. How we use data</h2>
      <p>To fulfil orders, communicate about purchases, prevent fraud, and improve the Site.</p>
      <h2>4. Sharing</h2>
      <p>
        We share data with service providers (hosting, payments, shipping, email) strictly to
        operate the store. We may disclose information if required by law.
      </p>
      <h2>5. Retention</h2>
      <p>
        We keep order and account data as needed for legal, tax, and support purposes, then delete
        or anonymise where appropriate.
      </p>
      <h2>6. Your choices</h2>
      <p>
        You may request access or correction of personal data subject to applicable law. Start via{" "}
        <Link href="/support">support</Link>.
      </p>
      <h2>7. Updates</h2>
      <p>
        We may revise this policy; the “Last updated” date will change. Continued use after updates
        means you accept the revised policy where permitted.
      </p>
    </MarketingPageWithCms>
  );
}
