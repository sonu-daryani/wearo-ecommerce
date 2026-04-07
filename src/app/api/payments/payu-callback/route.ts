import { NextResponse } from "next/server";
import { verifyPayuCallbackForm } from "@/lib/payments/verify-payment";

export const dynamic = "force-dynamic";

function redirect(origin: string, path: string) {
  return NextResponse.redirect(new URL(path, origin));
}

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  let params: URLSearchParams;
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      params = new URLSearchParams();
      fd.forEach((v, k) => {
        if (typeof v === "string") params.set(k, v);
      });
    } else {
      const text = await req.text();
      params = new URLSearchParams(text);
    }
  } catch {
    return redirect(origin, "/checkout?payu=invalid");
  }

  const result = await verifyPayuCallbackForm(params);
  if (result.ok) {
    return redirect(
      origin,
      `/order-confirmation?token=${encodeURIComponent(result.publicToken)}`
    );
  }
  const tokenQ = result.publicToken
    ? `&token=${encodeURIComponent(result.publicToken)}`
    : "";
  return redirect(
    origin,
    `/checkout?payu=failed&reason=${encodeURIComponent(result.error)}${tokenQ}`
  );
}
