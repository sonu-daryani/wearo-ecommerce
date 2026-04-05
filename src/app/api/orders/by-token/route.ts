import { API_MESSAGES } from "@/lib/api/api-messages";
import { apiError, apiSuccess } from "@/lib/api/http-responses";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) {
    return apiError(API_MESSAGES.ORDERS.MISSING_TOKEN, 400);
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
    return apiError(API_MESSAGES.ORDERS.NOT_FOUND, 404);
  }

  return apiSuccess(order, API_MESSAGES.ORDERS.LOADED, 200);
}
