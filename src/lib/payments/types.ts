export const PAYMENT_PROVIDER_IDS = ["STRIPE", "RAZORPAY", "CASHFREE"] as const;
export type PaymentProviderId = (typeof PAYMENT_PROVIDER_IDS)[number];

export function isPaymentProviderId(v: string): v is PaymentProviderId {
  return (PAYMENT_PROVIDER_IDS as readonly string[]).includes(v);
}

/** Client + server: what `/api/payments/session` returns (shape varies by provider). */
export type PaymentSessionPayload =
  | { provider: "CASHFREE"; paymentSessionId: string; cashfreeMode: "sandbox" | "production" }
  | { provider: "STRIPE"; checkoutUrl: string }
  | {
      provider: "RAZORPAY";
      keyId: string;
      orderId: string;
      amount: number;
      currency: string;
      companyName: string;
      description: string;
      customerName: string;
      customerEmail: string;
      customerContact: string;
    };

export type CreateSessionResult =
  | { ok: true; payload: PaymentSessionPayload }
  | { ok: false; error: string; status: number };

export type VerifyResult = { ok: true } | { ok: false; error: string; status: number };
