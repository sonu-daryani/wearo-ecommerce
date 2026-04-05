import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPublicCompanySettings } from "@/lib/company-settings";
import {
  createOrderRecord,
  validateAndSummarizeLines,
  type OrderLineInput,
  type ShippingInput,
} from "@/lib/orders/create-order";

export const dynamic = "force-dynamic";

const EPS = 0.02;

type Body = {
  shipping: ShippingInput;
  paymentMethod: "cod" | "online";
  paymentProvider?: string | null;
  items: OrderLineInput[];
  codFee: number;
  grandTotal: number;
};

function pickProvider(allowed: string[], requested: string | null | undefined): string | null {
  if (!allowed.length) return null;
  if (requested && allowed.includes(requested)) return requested;
  return allowed[0] ?? null;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { shipping, paymentMethod, items, codFee, grandTotal } = body;
  if (!shipping?.fullName || !shipping?.email || !shipping?.phone || !shipping?.address) {
    return NextResponse.json({ error: "Missing shipping fields." }, { status: 400 });
  }
  if (paymentMethod !== "cod" && paymentMethod !== "online") {
    return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
  }
  if (!Array.isArray(items) || !items.length) {
    return NextResponse.json({ error: "No items." }, { status: 400 });
  }

  const company = await getPublicCompanySettings();
  const { checkout, currency } = company;

  if (paymentMethod === "cod" && !checkout.codAvailable) {
    return NextResponse.json({ error: "COD is not available." }, { status: 400 });
  }
  if (paymentMethod === "online" && !checkout.onlineAvailable) {
    return NextResponse.json({ error: "Online payment is not available." }, { status: 400 });
  }

  const summary = await validateAndSummarizeLines(items);
  if (!summary.ok) {
    return NextResponse.json({ error: summary.error }, { status: 400 });
  }

  const { subtotal, adjustedSubtotal } = summary;
  const discountAmount = Math.max(0, subtotal - adjustedSubtotal);

  let serverCodFee = 0;
  if (paymentMethod === "cod") {
    if (checkout.codWaiveFeeAboveAmount != null && adjustedSubtotal >= checkout.codWaiveFeeAboveAmount) {
      serverCodFee = 0;
    } else {
      serverCodFee = (checkout.codFeeFlat || 0) + (adjustedSubtotal * (checkout.codFeePercent || 0)) / 100;
    }
  }

  const serverGrand = adjustedSubtotal + serverCodFee;
  if (Math.abs(serverGrand - Number(grandTotal)) > EPS || Math.abs(serverCodFee - Number(codFee)) > EPS) {
    return NextResponse.json({ error: "Totals do not match. Refresh and try again." }, { status: 400 });
  }

  const paymentProvider =
    paymentMethod === "online"
      ? pickProvider(checkout.onlineProviders, body.paymentProvider ?? null)
      : null;

  if (paymentMethod === "online" && checkout.onlineProviders.length > 0 && !paymentProvider) {
    return NextResponse.json({ error: "No payment provider configured." }, { status: 400 });
  }

  const session = await auth();
  const orderUserId = session?.user?.id ?? null;

  try {
    const { publicToken, orderNumber } = await createOrderRecord({
      shipping,
      paymentMethod,
      paymentProvider,
      currencyCode: currency.code,
      items,
      subtotal,
      discountAmount,
      codFee: serverCodFee,
      grandTotal: serverGrand,
      userId: orderUserId,
    });

    return NextResponse.json({
      publicToken,
      orderNumber,
      requiresPaymentConfirmation: paymentMethod === "online",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }
}
