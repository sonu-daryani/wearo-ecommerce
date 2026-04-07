export const PAYMENT_PROVIDER_IDS = ["CASHFREE", "RAZORPAY", "PAYTM", "PHONEPE", "PAYU"] as const;
export type PaymentProviderId = (typeof PAYMENT_PROVIDER_IDS)[number];

export function isPaymentProviderId(v: string): v is PaymentProviderId {
  return (PAYMENT_PROVIDER_IDS as readonly string[]).includes(v);
}

export type RazorpaySessionPayload = {
  provider: "RAZORPAY";
  keyId: string;
  /** Razorpay order id (`order_…`) */
  orderId: string;
  amount: number;
  currency: string;
  companyName: string;
  orderNumber: string;
  publicToken: string;
  prefill: { name: string; email: string; contact: string };
};

export type CashfreeSessionPayload = {
  provider: "CASHFREE";
  paymentSessionId: string;
  publicToken: string;
  env: "sandbox" | "production";
};

export type PayuSessionPayload = {
  provider: "PAYU";
  actionUrl: string;
  fields: Record<string, string>;
  publicToken: string;
};

/** Client + server: what `/api/payments/session` returns (shape varies by provider). */
export type PaymentSessionPayload =
  | CashfreeSessionPayload
  | RazorpaySessionPayload
  | { provider: "PAYTM" }
  | { provider: "PHONEPE" }
  | PayuSessionPayload;

export type CreateSessionResult =
  | { ok: true; payload: PaymentSessionPayload }
  | { ok: false; error: string; status: number };

export type VerifyResult = { ok: true; paid: boolean } | { ok: false; error: string; status: number };
