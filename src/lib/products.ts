import {
  newArrivalsData,
  relatedProductData,
  topSellingData,
} from "@/data/homepage";
import type { Product } from "@/types/product.types";

export const allProducts: Product[] = [
  ...newArrivalsData,
  ...topSellingData,
  ...relatedProductData,
];

export function getProductById(id: number): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

export function productDisplayPrice(product: Product): string {
  if (product.discount.percentage > 0) {
    const final = Math.round(
      product.price - (product.price * product.discount.percentage) / 100
    );
    return `$${final}`;
  }
  if (product.discount.amount > 0) {
    return `$${product.price - product.discount.amount}`;
  }
  return `$${product.price}`;
}
