import prisma from "@/lib/prisma";

const listSelect = {
  publicToken: true,
  orderNumber: true,
  createdAt: true,
  grandTotal: true,
  currencyCode: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  paymentProvider: true,
} as const;

export type AccountOrderRow = {
  publicToken: string;
  orderNumber: string;
  createdAt: Date;
  grandTotal: number;
  currencyCode: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentProvider: string | null;
};

export async function listOrdersForAccount(userId: string): Promise<AccountOrderRow[]> {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: listSelect,
  });
}
