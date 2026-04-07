import prisma from "@/lib/prisma";
import { mapDbToProduct } from "@/lib/product-mapper";
import type { Product } from "@/types/product.types";
import type { Product as ProductRow } from "@prisma/client";

export async function getProductById(id: number): Promise<Product | undefined> {
  const p = await prisma.product.findFirst({
    where: { id, published: true },
  });
  return p ? mapDbToProduct(p) : undefined;
}

export async function getProductRowById(id: number): Promise<ProductRow | null> {
  return prisma.product.findUnique({ where: { id } });
}

export async function listNewArrivals(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { published: true, sectionNewArrival: true },
    orderBy: { id: "asc" },
  });
  return rows.map(mapDbToProduct);
}

export async function listTopSelling(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { published: true, sectionTopSelling: true },
    orderBy: { id: "asc" },
  });
  return rows.map(mapDbToProduct);
}

export async function listRelatedForProduct(excludeId: number): Promise<Product[]> {
  let rows = await prisma.product.findMany({
    where: {
      published: true,
      sectionRelated: true,
      NOT: { id: excludeId },
    },
    orderBy: { id: "asc" },
  });
  if (rows.length === 0) {
    rows = await prisma.product.findMany({
      where: { published: true, NOT: { id: excludeId } },
      orderBy: { id: "asc" },
      take: 8,
    });
  }
  return rows.map(mapDbToProduct);
}

export async function listPublishedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { published: true },
    orderBy: { id: "asc" },
  });
  return rows.map(mapDbToProduct);
}

/** Products for checkout upsell: related-section first, then any other in-stock ideas, excluding cart line ids. */
export async function listCheckoutUpsell(
  excludeIds: number[],
  take = 6
): Promise<Product[]> {
  const exclude = excludeIds.filter((n) => Number.isFinite(n) && n > 0);
  const idFilter =
    exclude.length > 0 ? { NOT: { id: { in: exclude } } } : {};

  const related = await prisma.product.findMany({
    where: { published: true, sectionRelated: true, ...idFilter },
    orderBy: { id: "asc" },
    take,
  });

  if (related.length >= take) {
    return related.map(mapDbToProduct);
  }

  const filled = [...related];
  const seen = new Set(filled.map((r) => r.id));
  const filler = await prisma.product.findMany({
    where: { published: true, ...idFilter },
    orderBy: { id: "asc" },
    take: take * 3,
  });
  for (const row of filler) {
    if (filled.length >= take) break;
    if (!seen.has(row.id)) {
      filled.push(row);
      seen.add(row.id);
    }
  }

  return filled.slice(0, take).map(mapDbToProduct);
}

export async function getNextProductId(): Promise<number> {
  const agg = await prisma.product.aggregate({ _max: { id: true } });
  return (agg._max.id ?? 0) + 1;
}
