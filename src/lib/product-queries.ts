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

export async function getNextProductId(): Promise<number> {
  const agg = await prisma.product.aggregate({ _max: { id: true } });
  return (agg._max.id ?? 0) + 1;
}
