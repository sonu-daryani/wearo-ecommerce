function cashfreePgBaseUrl(): string {
  const env = process.env.CASHFREE_ENV?.trim().toLowerCase();
  return env === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
}

export function cashfreeJsMode(): "sandbox" | "production" {
  return process.env.CASHFREE_ENV?.trim().toLowerCase() === "production" ? "production" : "sandbox";
}

type CreateOrderBody = {
  order_id: string;
  order_amount: number;
  order_currency: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  order_meta?: {
    return_url?: string;
    notify_url?: string;
  };
};

export async function cashfreeCreateOrder(params: {
  clientId: string;
  clientSecret: string;
  body: CreateOrderBody;
}): Promise<{ payment_session_id: string } | { error: string }> {
  const base = cashfreePgBaseUrl();
  const res = await fetch(`${base}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": params.clientId,
      "x-client-secret": params.clientSecret,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify(params.body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    payment_session_id?: string;
    message?: string;
  };
  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Cashfree could not create an order.";
    return { error: msg };
  }
  if (!data.payment_session_id) {
    return { error: "Cashfree returned an invalid order response." };
  }
  return { payment_session_id: data.payment_session_id };
}

export async function cashfreeFetchOrder(params: {
  clientId: string;
  clientSecret: string;
  merchantOrderId: string;
}): Promise<
  | { order_status: string; order_amount: number; order_currency: string }
  | { error: string }
> {
  const base = cashfreePgBaseUrl();
  const id = encodeURIComponent(params.merchantOrderId);
  const res = await fetch(`${base}/orders/${id}`, {
    method: "GET",
    headers: {
      "x-client-id": params.clientId,
      "x-client-secret": params.clientSecret,
      "x-api-version": "2023-08-01",
    },
  });
  const data = (await res.json().catch(() => ({}))) as {
    order_status?: string;
    order_amount?: number;
    order_currency?: string;
    message?: string;
  };
  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Could not fetch Cashfree order.";
    return { error: msg };
  }
  if (!data.order_status || data.order_amount == null) {
    return { error: "Invalid Cashfree order response." };
  }
  return {
    order_status: data.order_status,
    order_amount: Number(data.order_amount),
    order_currency: String(data.order_currency ?? "INR"),
  };
}
