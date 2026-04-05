"use client";

import BreadcrumbCart from "@/components/cart-page/BreadcrumbCart";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import type { PublicCompanySettings } from "@/lib/company-settings";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa6";
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa6";

function formatMoney(amount: number, currency: PublicCompanySettings["currency"]) {
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(currency.decimalPlaces)}`;
  }
}

function codFeeForSubtotal(
  subtotal: number,
  c: PublicCompanySettings["checkout"]
): number {
  if (c.codWaiveFeeAboveAmount != null && subtotal >= c.codWaiveFeeAboveAmount) {
    return 0;
  }
  const pct = (subtotal * (c.codFeePercent || 0)) / 100;
  return (c.codFeeFlat || 0) + pct;
}

const PROVIDER_LABELS: Record<string, string> = {
  STRIPE: "Stripe",
  RAZORPAY: "Razorpay",
  CASHFREE: "Cashfree",
};

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { cart, totalPrice, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );
  const [submitting, setSubmitting] = useState(false);
  const [company, setCompany] = useState<PublicCompanySettings | null>(null);
  const [payMethod, setPayMethod] = useState<"cod" | "online" | null>(null);
  const [onlineProvider, setOnlineProvider] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/company-settings");
        const data = (await res.json()) as PublicCompanySettings;
        if (!cancelled) {
          setCompany(data);
          const { checkout } = data;
          if (checkout.codAvailable && !checkout.onlineAvailable) setPayMethod("cod");
          else if (!checkout.codAvailable && checkout.onlineAvailable) setPayMethod("online");
          else if (checkout.codAvailable && checkout.onlineAvailable) setPayMethod("cod");
          else setPayMethod(null);
          const first = checkout.onlineProviders[0] ?? "";
          setOnlineProvider(first);
        }
      } catch {
        if (!cancelled) setCompany(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currency = company?.currency ?? {
    code: "INR",
    symbol: "₹",
    locale: "en-IN",
    decimalPlaces: 2,
  };

  const checkoutCfg = company?.checkout;

  const codExtra = useMemo(() => {
    if (!checkoutCfg || payMethod !== "cod") return 0;
    return codFeeForSubtotal(adjustedTotalPrice, checkoutCfg);
  }, [checkoutCfg, payMethod, adjustedTotalPrice]);

  const grandTotal = adjustedTotalPrice + codExtra;

  if (!cart || cart.items.length === 0) {
    return (
      <main className="pb-20 max-w-frame mx-auto px-4 xl:px-0 pt-12 text-center">
        <p className="text-black/60 mb-4">Your cart is empty.</p>
        <Button asChild className="rounded-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </main>
    );
  }

  const noPayment =
    checkoutCfg && !checkoutCfg.codAvailable && !checkoutCfg.onlineAvailable;

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (noPayment || !payMethod || !cart) {
      toast.error("No payment method is available. Ask the store to enable payments in admin.");
      return;
    }
    if (
      payMethod === "online" &&
      checkoutCfg &&
      checkoutCfg.onlineProviders.length > 0 &&
      !onlineProvider
    ) {
      toast.error("Choose a payment provider.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const shipping = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      address: String(fd.get("address") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      pin: String(fd.get("pin") ?? "").trim(),
    };

    const items = cart.items.map((item) => ({
      id: item.id,
      name: item.name,
      srcUrl: item.srcUrl,
      price: item.price,
      quantity: item.quantity,
      attributes: item.attributes,
      discount: item.discount,
    }));

    setSubmitting(true);
    try {
      const placeRes = await fetch("/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping,
          paymentMethod: payMethod,
          paymentProvider: payMethod === "online" ? onlineProvider || null : null,
          items,
          codFee: codExtra,
          grandTotal,
        }),
      });
      const placeData = await placeRes.json().catch(() => ({}));
      if (!placeRes.ok) {
        toast.error(typeof placeData.error === "string" ? placeData.error : "Could not place order.");
        return;
      }

      const { publicToken, requiresPaymentConfirmation } = placeData as {
        publicToken: string;
        orderNumber: string;
        requiresPaymentConfirmation?: boolean;
      };

      if (requiresPaymentConfirmation && publicToken) {
        const payRes = await fetch("/api/orders/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicToken }),
        });
        const payData = await payRes.json().catch(() => ({}));
        if (!payRes.ok) {
          toast.error(
            typeof payData.error === "string" ? payData.error : "Payment could not be confirmed."
          );
          return;
        }
      }

      dispatch(clearCart());
      toast.success(
        payMethod === "cod"
          ? "Order placed — pay on delivery."
          : "Payment successful — thank you for your order."
      );
      router.push(`/order-confirmation?token=${encodeURIComponent(publicToken)}`);
    } finally {
      setSubmitting(false);
    }
  }

  const channelLabels: string[] = [];
  if (checkoutCfg?.onlineChannels.upi) channelLabels.push("UPI");
  if (checkoutCfg?.onlineChannels.card) channelLabels.push("Cards");
  if (checkoutCfg?.onlineChannels.wallet) channelLabels.push("Wallets");
  if (checkoutCfg?.onlineChannels.netBanking) channelLabels.push("Net banking");

  return (
    <main className="pb-24 min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-100/80">
      <div className="max-w-frame mx-auto px-4 xl:px-0 pt-6 md:pt-10">
        <BreadcrumbCart />
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-black/55 hover:text-black mt-4 mb-6 transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back to cart
        </Link>

        <h1
          className={cn(
            integralCF.className,
            "font-bold text-[30px] md:text-[42px] text-black uppercase tracking-tight mb-2"
          )}
        >
          Checkout
        </h1>
        <p className="text-sm text-black/50 mb-8 max-w-xl">
          Review your bag, enter shipping details, and pay securely — only methods enabled in your store admin are
          shown below.
        </p>

        <form onSubmit={placeOrder} className="flex flex-col xl:flex-row gap-8 xl:gap-10 items-start">
          <div className="w-full xl:flex-1 space-y-6">
            <section className="rounded-2xl border border-black/[0.08] bg-white/90 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.25)] backdrop-blur-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-black/5 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-xs font-bold">
                  1
                </span>
                <h2 className="text-lg font-bold text-black">Shipping</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputGroup className="sm:col-span-2">
                  <InputGroup.Input name="fullName" required placeholder="Full name" />
                </InputGroup>
                <InputGroup>
                  <InputGroup.Input type="email" name="email" required placeholder="Email" />
                </InputGroup>
                <InputGroup>
                  <InputGroup.Input type="tel" name="phone" required placeholder="Phone" />
                </InputGroup>
                <InputGroup className="sm:col-span-2">
                  <InputGroup.Input name="address" required placeholder="Street address" />
                </InputGroup>
                <InputGroup>
                  <InputGroup.Input name="city" required placeholder="City" />
                </InputGroup>
                <InputGroup>
                  <InputGroup.Input name="pin" required placeholder="PIN / ZIP code" />
                </InputGroup>
              </div>
            </section>

            <section className="rounded-2xl border border-black/[0.08] bg-white/90 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.25)] backdrop-blur-sm p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-2 border-b border-black/5 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-xs font-bold">
                  2
                </span>
                <h2 className="text-lg font-bold text-black">Payment</h2>
              </div>

              {!company && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  Loading payment options…
                </p>
              )}

              {company && noPayment && (
                <p className="text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  No payment methods are enabled. Please contact the store or enable COD / online payments in{" "}
                  <strong>Admin → Payment settings</strong>.
                </p>
              )}

              {checkoutCfg && !noPayment && (
                <div className="space-y-3">
                  {checkoutCfg.codAvailable && (
                    <label
                      className={cn(
                        "flex cursor-pointer gap-4 rounded-2xl border-2 p-4 transition-all",
                        payMethod === "cod"
                          ? "border-black bg-black/[0.03] ring-1 ring-black/10"
                          : "border-black/10 hover:border-black/25"
                      )}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        value="cod"
                        checked={payMethod === "cod"}
                        onChange={() => setPayMethod("cod")}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FaMoneyBillWave className="text-emerald-600 text-lg shrink-0" />
                          <span className="font-semibold text-black">Cash on Delivery</span>
                        </div>
                        <p className="text-xs text-black/50 mt-1">Pay when your order arrives at your door.</p>
                        {payMethod === "cod" && codExtra > 0 && (
                          <p className="text-xs font-medium text-amber-800 mt-2">
                            COD handling fee: {formatMoney(codExtra, currency)}
                          </p>
                        )}
                        {payMethod === "cod" &&
                          checkoutCfg.codWaiveFeeAboveAmount != null &&
                          checkoutCfg.codWaiveFeeAboveAmount > 0 && (
                            <p className="text-[11px] text-black/45 mt-1">
                              Fee waived on orders {formatMoney(checkoutCfg.codWaiveFeeAboveAmount, currency)}+.
                            </p>
                          )}
                      </div>
                    </label>
                  )}

                  {checkoutCfg.onlineAvailable && (
                    <label
                      className={cn(
                        "flex cursor-pointer gap-4 rounded-2xl border-2 p-4 transition-all",
                        payMethod === "online"
                          ? "border-black bg-black/[0.03] ring-1 ring-black/10"
                          : "border-black/10 hover:border-black/25"
                      )}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        value="online"
                        checked={payMethod === "online"}
                        onChange={() => setPayMethod("online")}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FaCreditCard className="text-indigo-600 text-lg shrink-0" />
                          <span className="font-semibold text-black">Pay online</span>
                        </div>
                        <p className="text-xs text-black/50 mt-1">
                          {channelLabels.length > 0
                            ? channelLabels.join(" · ")
                            : "UPI, cards, wallets & net banking"}
                        </p>
                        {checkoutCfg.onlineProviders.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {checkoutCfg.onlineProviders.map((p) => (
                              <span
                                key={p}
                                className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-100"
                              >
                                {PROVIDER_LABELS[p] ?? p}
                              </span>
                            ))}
                          </div>
                        )}
                        {payMethod === "online" && checkoutCfg.onlineProviders.length > 1 && (
                          <div className="mt-3">
                            <label htmlFor="checkout-provider" className="text-xs font-medium text-black/55 block mb-1">
                              Choose provider
                            </label>
                            <select
                              id="checkout-provider"
                              value={onlineProvider}
                              onChange={(ev) => setOnlineProvider(ev.target.value)}
                              className="w-full max-w-xs rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                            >
                              {checkoutCfg.onlineProviders.map((p) => (
                                <option key={p} value={p}>
                                  {PROVIDER_LABELS[p] ?? p}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              )}

              {company?.paymentInstructions && (
                <div className="rounded-xl bg-neutral-50 border border-black/5 px-4 py-3 text-xs text-black/65 whitespace-pre-wrap">
                  {company.paymentInstructions}
                </div>
              )}
            </section>
          </div>

          <aside className="w-full xl:w-[420px] xl:sticky xl:top-8 shrink-0">
            <div className="rounded-2xl border border-black/[0.08] bg-white shadow-[0_32px_90px_-40px_rgba(0,0,0,0.35)] p-6 md:p-7 space-y-5">
              <h3 className="text-xl font-bold text-black">Order summary</h3>
              <ul className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <li
                    key={`${item.id}-${item.attributes.join("-")}`}
                    className="flex gap-3 items-center text-sm"
                  >
                    <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-black/5">
                      <Image src={item.srcUrl} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-black truncate">{item.name}</p>
                      <p className="text-xs text-black/45">
                        {item.attributes.filter(Boolean).join(" · ")} · Qty {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="h-px bg-black/8" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-black/55">
                  <span>Subtotal</span>
                  <span className="font-medium text-black tabular-nums">
                    {formatMoney(totalPrice, currency)}
                  </span>
                </div>
                {totalPrice !== adjustedTotalPrice && (
                  <div className="flex justify-between text-emerald-700">
                    <span>After discount</span>
                    <span className="font-medium tabular-nums">
                      {formatMoney(adjustedTotalPrice, currency)}
                    </span>
                  </div>
                )}
                {payMethod === "cod" && codExtra > 0 && (
                  <div className="flex justify-between text-amber-800">
                    <span>COD fee</span>
                    <span className="font-medium tabular-nums">{formatMoney(codExtra, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-black/60 font-medium">Total</span>
                  <span className="text-2xl font-bold text-black tabular-nums">
                    {formatMoney(grandTotal, currency)}
                  </span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitting || !company || noPayment || !payMethod}
                className="w-full rounded-full bg-black h-12 md:h-14 text-base font-semibold tracking-wide hover:bg-black/90 disabled:opacity-40"
              >
                {submitting ? "Placing order…" : "Place order"}
              </Button>
              <p className="text-[11px] text-center text-black/40 leading-relaxed">
                Secure checkout · Demo mode — connect Stripe, Razorpay, or Cashfree in admin when you go live.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
