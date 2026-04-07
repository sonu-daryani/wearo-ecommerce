/** Load Cashfree.js v3 once (browser only). */
export function loadCashfreeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cashfree requires a browser."));
      return;
    }
    const w = window as unknown as { Cashfree?: unknown };
    if (w.Cashfree) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[data-wearo-cashfree="1"]'
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Cashfree failed to load.")), {
        once: true,
      });
      return;
    }
    const s = document.createElement("script");
    s.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    s.async = true;
    s.dataset.wearoCashfree = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Cashfree failed to load."));
    document.body.appendChild(s);
  });
}

export type CashfreeCheckoutInstance = {
  checkout: (opts: {
    paymentSessionId: string;
    redirectTarget?: string;
  }) => Promise<unknown>;
};

export type CashfreeFactory = (opts: { mode: "sandbox" | "production" }) => CashfreeCheckoutInstance;

export function getCashfreeFactory(): CashfreeFactory | null {
  const fn = (window as unknown as { Cashfree?: CashfreeFactory }).Cashfree;
  return typeof fn === "function" ? fn : null;
}
