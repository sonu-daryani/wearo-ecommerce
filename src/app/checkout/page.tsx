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
import { FaMoneyBillWave } from "react-icons/fa6";
import { SiPaytm, SiPhonepe, SiRazorpay } from "react-icons/si";
import type {
  CashfreeSessionPayload,
  PaymentSessionPayload,
  PayuSessionPayload,
  RazorpaySessionPayload,
} from "@/lib/payments/types";
import { getCashfreeFactory, loadCashfreeScript } from "@/lib/payments/load-cashfree-script";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/payments/load-razorpay-script";
import { useApiLoading } from "@/hooks/use-api-loading";
import { getPlain, postEnvelope } from "@/lib/http/request-handler";
import { useCompanyCurrency } from "@/context/CompanyCurrencyContext";
import type { Product } from "@/types/product.types";
import ProductCard from "@/components/common/ProductCard";

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
  CASHFREE: "Cashfree",
  RAZORPAY: "Razorpay",
  PAYTM: "Paytm",
  PHONEPE: "PhonePe",
  PAYU: "PayU",
};

function channelDetailLine(ch: PublicCompanySettings["checkout"]["onlineChannels"]): string {
  const parts: string[] = [];
  if (ch.upi) parts.push("UPI");
  if (ch.card) parts.push("Debit & credit cards");
  if (ch.wallet) parts.push("Wallets");
  if (ch.netBanking) parts.push("Net banking");
  return parts.length > 0 ? parts.join(" · ") : "Cards, UPI & more";
}

function ProviderLogo({ provider }: { provider: string }) {
  const wrap =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-white shadow-sm";
  switch (provider) {
    case "RAZORPAY":
      return (
        <span className={wrap}>
          <SiRazorpay className="h-7 w-7 text-[#0C2451]" aria-hidden />
        </span>
      );
    case "PAYTM":
      return (
        <span className={wrap}>
          <SiPaytm className="h-7 w-7 text-[#00BAF2]" aria-hidden />
        </span>
      );
    case "PHONEPE":
      return (
        <span className={wrap}>
          <SiPhonepe className="h-7 w-7 text-[#5F259F]" aria-hidden />
        </span>
      );
    case "CASHFREE":
      return (
        <span
          className={`${wrap} bg-[#00B8A9]/10 border-[#00B8A9]/25 font-bold text-sm text-[#00796B]`}
          aria-hidden
        >
          CF
        </span>
      );
    case "PAYU":
      return (
        <span
          className={`${wrap} bg-amber-50 border-amber-200/80 font-bold text-xs tracking-tight text-amber-900`}
          aria-hidden
        >
          PayU
        </span>
      );
    default:
      return (
        <span
          className={`${wrap} bg-neutral-100 text-neutral-600 text-xs font-semibold`}
          aria-hidden
        >
          Pay
        </span>
      );
  }
}

function isProviderServerReady(company: PublicCompanySettings, provider: string): boolean {
  const r = company.paymentProviderReadiness;
  if (provider === "CASHFREE") return r.CASHFREE;
  if (provider === "RAZORPAY") return r.RAZORPAY;
  if (provider === "PAYTM") return r.PAYTM;
  if (provider === "PHONEPE") return r.PHONEPE;
  if (provider === "PAYU") return r.PAYU;
  return false;
}

function submitPayuHostedForm(actionUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.style.display = "none";
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

function providerNotReadyMessage(
  ui: PublicCompanySettings["checkoutUi"],
  provider: string
): string {
  if (provider === "CASHFREE") return ui.PROVIDER_NOT_READY_CASHFREE;
  if (provider === "RAZORPAY") return ui.PROVIDER_NOT_READY_RAZORPAY;
  if (provider === "PAYTM") return ui.PROVIDER_NOT_READY_PAYTM;
  if (provider === "PHONEPE") return ui.PROVIDER_NOT_READY_PHONEPE;
  if (provider === "PAYU") return ui.PROVIDER_NOT_READY_PAYU;
  return ui.PROVIDER_NOT_READY;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatPrice } = useCompanyCurrency();
  const { cart, totalPrice, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );
  const { loading: submitting, withLoading } = useApiLoading();
  const [company, setCompany] = useState<PublicCompanySettings | null>(null);
  const [payMethod, setPayMethod] = useState<"cod" | "online" | null>(null);
  const [onlineProvider, setOnlineProvider] = useState<string>("");
  const [upsell, setUpsell] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getPlain<PublicCompanySettings>("/api/company-settings");
      if (cancelled) return;
      if (!res.ok) {
        setCompany(null);
        return;
      }
      const data = res.data;
      setCompany(data);
      const { checkout } = data;
      if (checkout.codAvailable && !checkout.onlineAvailable) setPayMethod("cod");
      else if (!checkout.codAvailable && checkout.onlineAvailable) setPayMethod("online");
      else if (checkout.codAvailable && checkout.onlineAvailable) setPayMethod("cod");
      else setPayMethod(null);
      const first = checkout.onlineProviders[0] ?? "";
      setOnlineProvider(first);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cart?.items.length) {
      setUpsell([]);
      return;
    }
    const exclude = Array.from(new Set(cart.items.map((i) => i.id))).join(",");
    let cancelled = false;
    (async () => {
      const res = await getPlain<Product[]>(
        `/api/products/upsell?exclude=${encodeURIComponent(exclude)}&take=6`
      );
      if (!cancelled && res.ok) setUpsell(res.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [cart]);

  const currency = company?.currency ?? {
    code: "INR",
    symbol: "₹",
    locale: "en-IN",
    decimalPlaces: 2,
  };

  const checkoutCfg = company?.checkout;

  const roundedAdjusted = useMemo(() => Math.round(adjustedTotalPrice), [adjustedTotalPrice]);

  const codExtra = useMemo(() => {
    if (!checkoutCfg || payMethod !== "cod") return 0;
    return codFeeForSubtotal(adjustedTotalPrice, checkoutCfg);
  }, [checkoutCfg, payMethod, adjustedTotalPrice]);

  const savingsAmount = useMemo(
    () => Math.max(0, Math.round(totalPrice - adjustedTotalPrice)),
    [totalPrice, adjustedTotalPrice]
  );
  const discountPct = useMemo(
    () => (totalPrice > 0 ? Math.round((savingsAmount / totalPrice) * 100) : 0),
    [totalPrice, savingsAmount]
  );

  const grandTotal = roundedAdjusted + codExtra;

  if (!cart || cart.items.length === 0) {
    return (
      <main className="pb-20 max-w-frame mx-auto px-4 xl:px-0 pt-12 text-center">
        <p className="text-black/60 mb-4">{company ? company.checkoutUi.CART_EMPTY : "…"}</p>
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
    const form = e.currentTarget;
    const ui = company?.checkoutUi;
    if (noPayment || !payMethod || !cart) {
      toast.error(ui?.NO_PAYMENT_METHOD ?? "");
      return;
    }
    if (
      payMethod === "online" &&
      checkoutCfg &&
      checkoutCfg.onlineProviders.length > 0 &&
      !onlineProvider
    ) {
      toast.error(ui?.CHOOSE_PROVIDER ?? "");
      return;
    }
    if (payMethod === "online" && onlineProvider) {
      const fresh = await getPlain<PublicCompanySettings>("/api/company-settings");
      const live = fresh.ok ? fresh.data : company;
      if (live && !isProviderServerReady(live, onlineProvider)) {
        const msgs = live.checkoutUi;
        toast.error(providerNotReadyMessage(msgs, onlineProvider));
        if (fresh.ok) setCompany(live);
        return;
      }
      if (fresh.ok) setCompany(fresh.data);
    }

    const fd = new FormData(form);
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

    await withLoading(async () => {
      const placeRes = await postEnvelope<{
        publicToken: string;
        orderNumber: string;
        checkoutToken?: string;
      }>(
        "/api/orders/place",
        {
          shipping,
          paymentMethod: payMethod,
          paymentProvider: payMethod === "online" ? onlineProvider || null : null,
          items,
          codFee: codExtra,
          grandTotal,
        }
      );
      if (!placeRes.ok) {
        toast.error(placeRes.message);
        return;
      }

      const { publicToken } = placeRes.data;

      if (payMethod === "online") {
        const checkoutToken = placeRes.data.checkoutToken;
        if (!checkoutToken) {
          toast.error(ui?.PAYMENT_INCOMPLETE ?? "Could not initialize checkout.");
          return;
        }
        const sessRes = await postEnvelope<PaymentSessionPayload>("/api/payments/session", {
          checkoutToken,
        });
        if (!sessRes.ok) {
          toast.error(sessRes.message);
          return;
        }
        const payload = sessRes.data;

        if (payload.provider === "PAYU") {
          const pu = payload as PayuSessionPayload;
          submitPayuHostedForm(pu.actionUrl, pu.fields);
          return;
        }

        if (payload.provider === "CASHFREE") {
          const cf = payload as CashfreeSessionPayload;
          try {
            await loadCashfreeScript();
          } catch {
            toast.error("Could not load Cashfree. Check your connection and try again.");
            return;
          }
          const Cashfree = getCashfreeFactory();
          if (!Cashfree) {
            toast.error("Cashfree checkout is not available in this browser.");
            return;
          }
          const cashfree = Cashfree({ mode: cf.env });
          try {
            await cashfree.checkout({
              paymentSessionId: cf.paymentSessionId,
              redirectTarget: "_modal",
            });
          } catch {
            /* modal closed or SDK error — still try verify in case payment completed */
          }
          const verifyCf = await postEnvelope<{ verified?: boolean; paid?: boolean }>(
            "/api/payments/verify",
            { publicToken: cf.publicToken }
          );
          if (!verifyCf.ok) {
            toast.error(verifyCf.message);
            return;
          }
          dispatch(clearCart());
          toast.success(ui?.ONLINE_SUCCESS_TOAST ?? placeRes.message);
          router.push(`/order-confirmation?token=${encodeURIComponent(publicToken)}`);
          return;
        }

        if (payload.provider === "RAZORPAY") {
          const rz = payload as RazorpaySessionPayload;

          try {
            await loadRazorpayScript();
          } catch {
            toast.error("Could not load the payment widget. Check your connection and try again.");
            return;
          }

          let settled = false;
          await new Promise<void>((resolve) => {
            const finish = () => {
              if (settled) return;
              settled = true;
              resolve();
            };

            openRazorpayCheckout({
              keyId: rz.keyId,
              amount: rz.amount,
              currency: rz.currency,
              orderId: rz.orderId,
              companyName: rz.companyName,
              orderNumber: rz.orderNumber,
              prefill: rz.prefill,
              onSuccess: async (response) => {
                try {
                  const verifyRes = await postEnvelope<{ verified?: boolean; paid?: boolean }>(
                    "/api/payments/verify",
                    {
                      checkoutToken,
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpayOrderId: response.razorpay_order_id,
                      razorpaySignature: response.razorpay_signature,
                    }
                  );
                  if (!verifyRes.ok) {
                    toast.error(verifyRes.message);
                    return;
                  }
                  dispatch(clearCart());
                  toast.success(ui?.ONLINE_SUCCESS_TOAST ?? placeRes.message);
                  router.push(`/order-confirmation?token=${encodeURIComponent(publicToken)}`);
                } finally {
                  finish();
                }
              },
              onDismiss: finish,
              onFailure: (msg) => {
                toast.error(msg);
                finish();
              },
            });
          });
          return;
        }

        toast.error(
          ui?.UNSUPPORTED_PROVIDER ??
            "This payment provider is not wired for checkout yet. Try Razorpay, Cashfree, PayU, or COD."
        );
        return;
      }

      dispatch(clearCart());
      toast.success(ui?.COD_SUCCESS_TOAST ?? placeRes.message);
      router.push(`/order-confirmation?token=${encodeURIComponent(publicToken)}`);
    });
  }

  const onlineChannelLine =
    checkoutCfg && checkoutCfg.onlineAvailable ? channelDetailLine(checkoutCfg.onlineChannels) : "";

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
                        name="checkoutPay"
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

                  {checkoutCfg.onlineAvailable && checkoutCfg.onlineProviders.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-black/40 px-1">
                        Pay online
                      </p>
                      {checkoutCfg.onlineProviders.length > 1 ? (
                        <p className="text-xs text-black/50 px-1 pb-1">
                          Pick one gateway. Your store accepts{" "}
                          <span className="font-medium text-black/65">{onlineChannelLine}</span>.
                        </p>
                      ) : (
                        <p className="text-xs text-black/50 px-1 pb-1">
                          <span className="font-medium text-black/65">{onlineChannelLine}</span>
                        </p>
                      )}
                      <div className="flex flex-col gap-2">
                        {checkoutCfg.onlineProviders.map((p) => {
                          const selected = payMethod === "online" && onlineProvider === p;
                          const ready = company ? isProviderServerReady(company, p) : false;
                          const multi = checkoutCfg.onlineProviders.length > 1;
                          return (
                            <label
                              key={p}
                              className={cn(
                                "flex cursor-pointer gap-4 rounded-2xl border-2 p-4 transition-all items-start",
                                selected
                                  ? "border-black bg-black/[0.03] ring-1 ring-black/10"
                                  : "border-black/10 hover:border-black/25"
                              )}
                            >
                              <input
                                type="radio"
                                name="checkoutPay"
                                value={p}
                                checked={selected}
                                onChange={() => {
                                  setPayMethod("online");
                                  setOnlineProvider(p);
                                }}
                                className="mt-1.5 shrink-0"
                              />
                              <ProviderLogo provider={p} />
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-black text-base">
                                    {PROVIDER_LABELS[p] ?? p}
                                  </span>
                                  {!ready && (
                                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-100">
                                      Setup required
                                    </span>
                                  )}
                                </div>
                                {!multi && (
                                  <p className="text-xs text-black/50 mt-1 leading-relaxed">
                                    Use {onlineChannelLine} and other methods enabled for your store at checkout.
                                  </p>
                                )}
                                <p
                                  className={cn(
                                    "text-[11px] text-black/40 leading-relaxed",
                                    multi ? "mt-1" : "mt-1.5"
                                  )}
                                >
                                  Secure checkout — keys are checked on the server when you place the order.
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {checkoutCfg.onlineAvailable && checkoutCfg.onlineProviders.length === 0 && (
                    <p className="text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      Online payments are enabled but no gateway is selected. Add a provider in{" "}
                      <strong>Admin → Payment settings</strong>.
                    </p>
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
                        {[item.attributes.filter(Boolean).join(" · "), `Qty ${item.quantity}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="h-px bg-black/8" />
              <div className="flex flex-col space-y-3 md:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base md:text-xl text-black/60">Subtotal</span>
                  <span className="text-base md:text-xl font-bold tabular-nums">{formatPrice(totalPrice)}</span>
                </div>
                {savingsAmount > 0 && (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base md:text-xl text-black/60">
                        Discount (-{discountPct}%)
                      </span>
                      <span className="text-base md:text-xl font-bold text-red-600 tabular-nums">
                        -{formatPrice(savingsAmount)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-100 rounded-xl px-3 py-2 text-center">
                      You save {formatPrice(savingsAmount)} on this order
                    </p>
                  </>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base md:text-xl text-black/60">Delivery fee</span>
                  <span className="text-base md:text-xl font-bold text-emerald-700">Free</span>
                </div>
                {payMethod === "cod" && codExtra > 0 && (
                  <div className="flex items-center justify-between gap-2 text-amber-900">
                    <span className="text-base md:text-xl text-amber-800/90">COD fee</span>
                    <span className="text-base md:text-xl font-bold tabular-nums">
                      {formatMoney(codExtra, currency)}
                    </span>
                  </div>
                )}
                <hr className="border-t border-black/10" />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base md:text-xl text-black font-semibold">Total</span>
                  <span className="text-xl md:text-2xl font-bold tabular-nums">
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
                {payMethod === "online" && company && onlineProvider && isProviderServerReady(company, onlineProvider)
                  ? `Secure checkout · ${PROVIDER_LABELS[onlineProvider] ?? onlineProvider} is configured.`
                  : payMethod === "online"
                    ? "Secure checkout · Finish gateway setup in Admin → Payment settings to take live payments."
                    : "Secure checkout · Pay on delivery."}
              </p>

              {upsell.length > 0 && (
                <div className="pt-6 mt-2 border-t border-black/10 space-y-4">
                  <h4 className="text-sm font-bold text-black uppercase tracking-wide">
                    You may also like
                  </h4>
                  <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-0.5 -mx-0.5">
                    {upsell.map((p) => (
                      <div key={p.id} className="min-w-0">
                        <ProductCard data={p} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
