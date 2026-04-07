import { createHmac, timingSafeEqual } from "crypto";
import type { OrderLineInput, ShippingInput } from "@/lib/orders/create-order";

type CheckoutIntentPayload = {
  version: 1;
  publicToken: string;
  orderNumber: string;
  shipping: ShippingInput;
  paymentProvider: string;
  currencyCode: string;
  items: OrderLineInput[];
  subtotal: number;
  discountAmount: number;
  codFee: number;
  grandTotal: number;
  userId: string | null;
  createdAtMs: number;
};

function secretKey(): string {
  return process.env.AUTH_SECRET?.trim() || "dev-checkout-intent-secret";
}

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(dataPart: string): string {
  return createHmac("sha256", secretKey()).update(dataPart).digest("base64url");
}

export type OnlineCheckoutIntentInput = Omit<CheckoutIntentPayload, "version" | "createdAtMs">;

export function createOnlineCheckoutIntentToken(input: OnlineCheckoutIntentInput): string {
  const payload: CheckoutIntentPayload = {
    version: 1,
    createdAtMs: Date.now(),
    ...input,
  };
  const dataPart = toBase64Url(JSON.stringify(payload));
  const sigPart = sign(dataPart);
  return `${dataPart}.${sigPart}`;
}

export function decodeOnlineCheckoutIntentToken(token: string): CheckoutIntentPayload | null {
  const [dataPart, sigPart] = token.split(".");
  if (!dataPart || !sigPart) return null;
  const expectedSig = sign(dataPart);
  if (expectedSig.length !== sigPart.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sigPart))) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(fromBase64Url(dataPart)) as CheckoutIntentPayload;
    if (parsed.version !== 1) return null;
    if (!parsed.publicToken || !parsed.orderNumber || !parsed.paymentProvider) return null;
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;
    if (!parsed.shipping?.email || !parsed.shipping?.fullName) return null;
    return parsed;
  } catch {
    return null;
  }
}
