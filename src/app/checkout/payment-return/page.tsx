"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getPlain, postEnvelope } from "@/lib/http/request-handler";
import type { PublicCompanySettings } from "@/lib/company-settings";
import { Suspense, useEffect, useState } from "react";

function PaymentReturnInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const sessionId = searchParams.get("session_id");
  const checkoutToken = searchParams.get("checkoutToken");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const settings = await getPlain<PublicCompanySettings>("/api/company-settings");
      const confirming = settings.ok
        ? settings.data.checkoutUi.CONFIRMING_PAYMENT
        : "";
      if (!cancelled) setMessage(confirming || "");

      if (!token) {
        if (!cancelled) {
          setMessage(
            settings.ok
              ? settings.data.checkoutUi.MISSING_ORDER_REF
              : ""
          );
        }
        return;
      }

      const body: Record<string, unknown> = checkoutToken
        ? { checkoutToken }
        : { publicToken: token };
      if (sessionId) {
        body.stripeSessionId = sessionId;
      }

      const res = await postEnvelope<{ verified: true }>("/api/payments/verify", body);
      if (cancelled) return;
      if (res.ok) {
        router.replace(`/order-confirmation?token=${encodeURIComponent(token)}`);
        return;
      }
      setMessage(res.message);
    })();

    return () => {
      cancelled = true;
    };
  }, [token, sessionId, checkoutToken, router]);

  return (
    <main className="min-h-[50vh] max-w-frame mx-auto px-4 py-16 text-center">
      <p className="text-black/70 mb-6">{message || "…"}</p>
      {!token ? (
        <Button asChild className="rounded-full">
          <Link href="/checkout">Back to checkout</Link>
        </Button>
      ) : (
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/order-confirmation?token=${encodeURIComponent(token)}`}>View order</Link>
        </Button>
      )}
    </main>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[50vh] max-w-frame mx-auto px-4 py-16 text-center text-black/60">
          Loading…
        </main>
      }
    >
      <PaymentReturnInner />
    </Suspense>
  );
}
