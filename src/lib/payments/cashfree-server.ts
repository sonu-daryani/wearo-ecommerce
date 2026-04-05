/**
 * Cashfree PG REST calls (server-only). App ID + client secret come from CompanySettings (secret decrypted server-side).
 */

const API_VERSION = "2023-08-01";

export function cashfreePgBase(): string {
  return process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

export function cashfreeJsMode(): "sandbox" | "production" {
  return process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
}

function pickSessionId(data: Record<string, unknown>): string | null {
  const v = data.payment_session_id ?? data.paymentSessionId;
  return typeof v === "string" && v.length > 0 ? v : null;
}

function pickOrderStatus(data: Record<string, unknown>): string | null {
  const v = data.order_status ?? data.orderStatus;
  return typeof v === "string" ? v : null;
}

export async function cashfreeCreateOrder(params: {
  clientId: string;
  clientSecret: string;
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
}): Promise<{ ok: true; paymentSessionId: string } | { ok: false; error: string }> {
  const base = cashfreePgBase();
  const body = {
    order_id: params.orderId,
    order_amount: Number(params.orderAmount.toFixed(2)),
    order_currency: params.orderCurrency,
    customer_details: {
      customer_id: params.orderId,
      customer_name: params.customerName.slice(0, 120),
      customer_email: params.customerEmail.slice(0, 120),
      customer_phone: params.customerPhone.slice(0, 20),
    },
    order_meta: {
      return_url: params.returnUrl,
    },
  };

  const res = await fetch(`${base}/orders`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-version": API_VERSION,
      "x-client-id": params.clientId,
      "x-client-secret": params.clientSecret,
    },
    body: JSON.stringify(body),
  });

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    /* empty */
  }

  if (!res.ok) {
    const msg =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : `Cashfree create order failed (${res.status})`;
    return { ok: false, error: msg };
  }

  let paymentSessionId = pickSessionId(data);
  if (!paymentSessionId && data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    paymentSessionId = pickSessionId(data.data as Record<string, unknown>);
  }
  if (!paymentSessionId) {
    return { ok: false, error: "Cashfree did not return a payment session." };
  }
  return { ok: true, paymentSessionId };
}

export async function cashfreeGetOrderStatus(params: {
  clientId: string;
  clientSecret: string;
  orderId: string;
}): Promise<{ ok: true; orderStatus: string } | { ok: false; error: string }> {
  const base = cashfreePgBase();
  const url = `${base}/orders/${encodeURIComponent(params.orderId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-version": API_VERSION,
      "x-client-id": params.clientId,
      "x-client-secret": params.clientSecret,
    },
  });

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    /* empty */
  }

  if (!res.ok) {
    const msg =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : `Cashfree get order failed (${res.status})`;
    return { ok: false, error: msg };
  }

  let orderStatus = pickOrderStatus(data);
  if (!orderStatus && data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    orderStatus = pickOrderStatus(data.data as Record<string, unknown>);
  }
  if (!orderStatus) {
    return { ok: false, error: "Could not read order status from Cashfree." };
  }
  return { ok: true, orderStatus };
}
