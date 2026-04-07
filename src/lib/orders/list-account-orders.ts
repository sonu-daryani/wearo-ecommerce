import prisma from "@/lib/prisma";

export const ACCOUNT_ORDERS_PAGE_SIZE = 10;

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

export type AccountOrdersPageResult = {
  orders: AccountOrderRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Newest orders first; stable tie-break on id. */
export async function listOrdersForAccountPage(
  userId: string,
  page: number
): Promise<AccountOrdersPageResult> {
  const total = await prisma.order.count({ where: { userId } });
  const pageSize = ACCOUNT_ORDERS_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const skip = (safePage - 1) * pageSize;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip,
    take: pageSize,
    select: listSelect,
  });

  return { orders, total, page: safePage, pageSize, totalPages };
}
