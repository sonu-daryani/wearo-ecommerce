/** Cashfree.js v3 global (https://sdk.cashfree.com/js/v3/cashfree.js) */

export type CashfreeCheckoutResult = {
  error?: unknown;
  redirect?: boolean;
  paymentDetails?: { paymentMessage?: string };
};

export type CashfreeInstance = {
  checkout: (opts: {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_top" | "_modal" | HTMLElement;
  }) => Promise<CashfreeCheckoutResult>;
};

declare global {
  interface Window {
    Cashfree?: (opts: { mode: "sandbox" | "production" }) => CashfreeInstance;
  }
}

const SCRIPT_ID = "cashfree-js-sdk-v3";

export function loadCashfreeJs(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Cashfree) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Cashfree script failed")), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.body.appendChild(s);
  });
}

export function openCashfreeModal(
  paymentSessionId: string,
  mode: "sandbox" | "production"
): Promise<CashfreeCheckoutResult> {
  if (!window.Cashfree) {
    return Promise.resolve({ error: "Cashfree SDK not loaded" });
  }
  const cashfree = window.Cashfree({ mode });
  return cashfree.checkout({
    paymentSessionId,
    redirectTarget: "_modal",
  });
}
