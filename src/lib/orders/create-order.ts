import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";

export type OrderLineInput = {
  id: number;
  name: string;
  srcUrl: string;
  price: number;
  quantity: number;
  attributes: string[];
  discount: { percentage: number; amount: number };
};

export type ShippingInput = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pin: string;
};

/** Recompute cart totals from DB product prices (anti-tamper). */
export async function validateAndSummarizeLines(
  items: OrderLineInput[]
): Promise<
  | { ok: true; subtotal: number; adjustedSubtotal: number }
  | { ok: false; error: string }
> {
  if (!items.length) return { ok: false, error: "Cart is empty." };

  let subtotal = 0;
  let adjustedSubtotal = 0;

  for (const line of items) {
    const product = await prisma.product.findUnique({
      where: { id: line.id },
      select: {
        id: true,
        title: true,
        price: true,
        discountAmount: true,
        discountPercentage: true,
        published: true,
      },
    });
    if (!product || !product.published) {
      return { ok: false, error: `Product ${line.id} is not available.` };
    }
    subtotal += product.price * line.quantity;
    const discPct = product.discountPercentage;
    const discAmt = product.discountAmount;
    const unit =
      discPct > 0
        ? Math.round(product.price - (product.price * discPct) / 100)
        : discAmt > 0
          ? Math.round(product.price - discAmt)
          : product.price;
    adjustedSubtotal += unit * line.quantity;
  }

  return { ok: true, subtotal, adjustedSubtotal };
}

function orderNumberFromDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return `WR-${y}${m}${day}-${rand}`;
}

export async function createOrderRecord(params: {
  shipping: ShippingInput;
  paymentMethod: "cod" | "online";
  paymentProvider: string | null;
  currencyCode: string;
  items: OrderLineInput[];
  subtotal: number;
  discountAmount: number;
  codFee: number;
  grandTotal: number;
  userId?: string | null;
}): Promise<{ publicToken: string; orderNumber: string }> {
  const publicToken = randomBytes(24).toString("base64url");
  const orderNumber = orderNumberFromDate();

  const itemsJson: Prisma.InputJsonValue = params.items.map((i) => ({
    id: i.id,
    name: i.name,
    srcUrl: i.srcUrl,
    price: i.price,
    quantity: i.quantity,
    attributes: i.attributes,
    discount: i.discount,
  }));

  const shippingJson: Prisma.InputJsonValue = {
    ...params.shipping,
    email: params.shipping.email.trim().toLowerCase(),
  };

  const isCod = params.paymentMethod === "cod";

  await prisma.order.create({
    data: {
      orderNumber,
      publicToken,
      status: isCod ? "CONFIRMED" : "PENDING_PAYMENT",
      paymentStatus: isCod ? "AWAITING_COD" : "PENDING",
      paymentMethod: params.paymentMethod,
      paymentProvider: params.paymentProvider,
      currencyCode: params.currencyCode,
      subtotal: params.subtotal,
      discountAmount: params.discountAmount,
      codFee: params.codFee,
      grandTotal: params.grandTotal,
      items: itemsJson,
      shipping: shippingJson,
      userId: params.userId ?? null,
    },
  });

  return { publicToken, orderNumber };
}

export async function markOnlinePaymentPaid(publicToken: string): Promise<{ ok: boolean; error?: string }> {
  const order = await prisma.order.findUnique({ where: { publicToken } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.paymentMethod !== "online") {
    return { ok: false, error: "Invalid payment flow." };
  }
  if (order.paymentStatus === "PAID") {
    return { ok: true };
  }
  if (order.paymentStatus !== "PENDING") {
    return { ok: false, error: "Payment cannot be completed for this order." };
  }

  await prisma.order.update({
    where: { publicToken },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
  });
  return { ok: true };
}
