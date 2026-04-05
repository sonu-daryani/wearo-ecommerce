import { NextResponse } from "next/server";
import { listPublishedProducts } from "@/lib/product-queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await listPublishedProducts();
  return NextResponse.json(products);
}
