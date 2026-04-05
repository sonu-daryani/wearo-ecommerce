import { NextResponse } from "next/server";
import { getPublicCompanySettings } from "@/lib/company-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPublicCompanySettings();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
