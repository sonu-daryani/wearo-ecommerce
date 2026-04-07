import { NextRequest, NextResponse } from "next/server";
import { listCheckoutUpsell } from "@/lib/product-queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("exclude") ?? "";
  const excludeIds = raw
    .split(/[,\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  const takeRaw = req.nextUrl.searchParams.get("take");
  const take = takeRaw
    ? Math.min(24, Math.max(1, Math.floor(Number(takeRaw))))
    : 6;

  const products = await listCheckoutUpsell(excludeIds, take);
  return NextResponse.json(products);
}
