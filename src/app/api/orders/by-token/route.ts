import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Public order summary for the confirmation page (no internal ids). */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { publicToken: token },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      paymentProvider: true,
      currencyCode: true,
      subtotal: true,
      discountAmount: true,
      codFee: true,
      grandTotal: true,
      items: true,
      shipping: true,
      createdAt: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(order);
}
