import { NextResponse } from "next/server";
import { getPublicCompanySettings } from "@/lib/company-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPublicCompanySettings();
  return NextResponse.json(data, {
    headers: {
      // Must not cache: includes paymentProviderReadiness (changes when admin saves secrets).
      "Cache-Control": "private, no-store, must-revalidate",
    },
  });
}
