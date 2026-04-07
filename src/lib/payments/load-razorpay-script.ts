/** Load Razorpay Checkout.js once (browser only). */
export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay requires a browser."));
      return;
    }
    const w = window as unknown as { Razorpay?: unknown };
    if (w.Razorpay) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[data-wearo-razorpay="1"]'
    ) as HTMLScriptElement | null;
    if (existing) {
      const onDone = () => resolve();
      const onErr = () => reject(new Error("Razorpay failed to load."));
      if (w.Razorpay) {
        resolve();
        return;
      }
      existing.addEventListener("load", onDone, { once: true });
      existing.addEventListener("error", onErr, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.dataset.wearoRazorpay = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Razorpay failed to load."));
    document.body.appendChild(s);
  });
}

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, fn: (payload: { error?: { description?: string } }) => void) => void;
};

export function openRazorpayCheckout(options: {
  keyId: string;
  amount: number;
  currency: string;
  orderId: string;
  companyName: string;
  orderNumber: string;
  prefill: { name: string; email: string; contact: string };
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss: () => void;
  onFailure: (message: string) => void;
}): void {
  const Ctor = (window as unknown as { Razorpay?: new (cfg: Record<string, unknown>) => RazorpayInstance })
    .Razorpay;
  if (!Ctor) {
    options.onFailure("Payment widget is not available.");
    return;
  }

  const rzp = new Ctor({
    key: options.keyId,
    amount: options.amount,
    currency: options.currency,
    order_id: options.orderId,
    name: options.companyName,
    description: `Order ${options.orderNumber}`,
    handler(response: RazorpaySuccessResponse) {
      options.onSuccess(response);
    },
    prefill: options.prefill,
    theme: { color: "#18181b" },
    modal: {
      ondismiss() {
        options.onDismiss();
      },
    },
  });

  rzp.on("payment.failed", (res) => {
    options.onFailure(res?.error?.description ?? "Payment failed.");
  });

  rzp.open();
}
