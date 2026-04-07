"use client";

import BreadcrumbCart from "@/components/cart-page/BreadcrumbCart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PublicCompanySettings } from "@/lib/company-settings";
import { getEnvelope, getPlain } from "@/lib/http/request-handler";
import React, { useEffect, useState, Suspense } from "react";
import { FaCircleCheck } from "react-icons/fa6";

type OrderItemRow = {
  id: number;
  name: string;
  srcUrl: string;
  price: number;
  quantity: number;
  attributes: string[];
  discount?: { percentage: number; amount: number };
};

type OrderPayload = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentProvider: string | null;
  currencyCode: string;
  subtotal: number;
  discountAmount: number;
  codFee: number;
  grandTotal: number;
  items: OrderItemRow[];
  shipping: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pin: string;
  };
  createdAt: string;
};

function lineRowTotal(item: OrderItemRow): number {
  const d = item.discount ?? { percentage: 0, amount: 0 };
  const unit =
    d.percentage > 0
      ? Math.round(item.price - (item.price * d.percentage) / 100)
      : d.amount > 0
        ? Math.round(item.price - d.amount)
        : item.price;
  return unit * item.quantity;
}

function formatMoney(amount: number, code: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

function OrderConfirmationInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [order, setOrder] = useState<OrderPayload | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [missingTokenMessage, setMissingTokenMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setOrder(null);
      void getPlain<PublicCompanySettings>("/api/company-settings").then((r) => {
        if (r.ok) setMissingTokenMessage(r.data.checkoutUi.MISSING_ORDER_REF);
      });
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await getEnvelope<OrderPayload>(
        `/api/orders/by-token?token=${encodeURIComponent(token)}`
      );
      if (cancelled) return;
      if (!res.ok) {
        setError(res.message);
        setOrder(null);
        return;
      }
      setOrder(res.data);
      setError(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <main className="pb-20 max-w-frame mx-auto px-4 xl:px-0 pt-12 text-center">
        <p className="text-black/60 mb-4">{missingTokenMessage ?? "…"}</p>
        <Button asChild className="rounded-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </main>
    );
  }

  if (order === undefined) {
    return (
      <main className="pb-20 max-w-frame mx-auto px-4 xl:px-0 pt-12 text-center">
        <p className="text-black/50">Loading your order…</p>
      </main>
    );
  }

  if (!order || error) {
    return (
      <main className="pb-20 max-w-frame mx-auto px-4 xl:px-0 pt-12 text-center">
        <p className="text-red-700 mb-4">{error ?? "Order not found."}</p>
        <Button asChild className="rounded-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </main>
    );
  }

  const paidOnline = order.paymentMethod === "online" && order.paymentStatus === "PAID";
  const failedOnline = order.paymentMethod === "online" && order.paymentStatus === "FAILED";
  const cod = order.paymentMethod === "cod";

  return (
    <main className="pb-24 min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-neutral-50">
      <div className="max-w-frame mx-auto px-4 xl:px-0 pt-8 md:pt-12">
        <BreadcrumbCart />
        <div className="max-w-2xl mx-auto text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <FaCircleCheck className="text-3xl" />
          </div>
          <h1
            className={cn(
              integralCF.className,
              "font-bold text-3xl md:text-4xl text-black uppercase tracking-tight mb-2"
            )}
          >
            Thank you
          </h1>
          <p className="text-black/60 text-sm md:text-base">
            {paidOnline && "Your payment was successful. We've received your order."}
            {cod && "Your order is confirmed. Pay with cash when your package arrives."}
            {failedOnline && "Payment failed. This checkout was not completed."}
            {!paidOnline && !cod && "We've received your order."}
          </p>
          <p className="mt-4 text-lg font-semibold text-black">
            Order <span className="font-mono text-indigo-700">{order.orderNumber}</span>
          </p>
          <p className="text-xs text-black/45 mt-1">
            Confirmation sent to {order.shipping.email} (demo — connect email service when ready).
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm space-y-3">
            <h2 className="font-bold text-black">Shipping to</h2>
            <p className="text-sm text-black/80">
              {order.shipping.fullName}
              <br />
              {order.shipping.address}
              <br />
              {order.shipping.city} {order.shipping.pin}
              <br />
              {order.shipping.phone}
            </p>
          </section>
          <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm space-y-3">
            <h2 className="font-bold text-black">Payment</h2>
            <p className="text-sm text-black/80">
              {order.paymentMethod === "cod"
                ? "Cash on delivery"
                : failedOnline
                  ? "Online payment failed"
                  : "Paid online"}
              {order.paymentProvider ? (
                <>
                  <br />
                  <span className="text-xs text-black/50">Provider: {order.paymentProvider}</span>
                </>
              ) : null}
            </p>
            <p className="text-xl font-bold text-black">{formatMoney(order.grandTotal, order.currencyCode)}</p>
          </section>
        </div>

        <section className="max-w-3xl mx-auto mt-8 rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-black mb-4">Items</h2>
          <ul className="space-y-4">
            {order.items.map((item) => (
              <li key={`${item.id}-${item.attributes?.join("-")}`} className="flex gap-4 items-center">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                  <Image src={item.srcUrl} alt="" fill className="object-cover" sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-black truncate">{item.name}</p>
                  <p className="text-xs text-black/45">
                    {(item.attributes ?? []).filter(Boolean).join(" · ")} · Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {formatMoney(lineRowTotal(item), order.currencyCode)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-4 border-t border-black/8 space-y-1 text-sm">
            <div className="flex justify-between text-black/55">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal, order.currencyCode)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span>−{formatMoney(order.discountAmount, order.currencyCode)}</span>
              </div>
            )}
            {order.codFee > 0 && (
              <div className="flex justify-between text-amber-800">
                <span>COD fee</span>
                <span>{formatMoney(order.codFee, order.currencyCode)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-black pt-2">
              <span>Total</span>
              <span>{formatMoney(order.grandTotal, order.currencyCode)}</span>
            </div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full px-8">
            <Link href="/shop">Continue shopping</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-8 border-black/20">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="pb-20 max-w-frame mx-auto px-4 pt-12 text-center text-black/50">Loading…</main>
      }
    >
      <OrderConfirmationInner />
    </Suspense>
  );
}
