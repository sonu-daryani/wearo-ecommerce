import prisma from "@/lib/prisma";
import { userCanViewOrder } from "./order-access";

export async function getAccountOrderDetail(
  publicToken: string,
  sessionUserId: string,
  sessionEmail: string | null | undefined
) {
  const order = await prisma.order.findUnique({
    where: { publicToken },
  });
  if (!order || !userCanViewOrder(order, sessionUserId, sessionEmail)) {
    return null;
  }
  return order;
}
