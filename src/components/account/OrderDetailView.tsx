import { Button } from "@/components/ui/button";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { Order } from "@prisma/client";
import { formatOrderMoney } from "./format-order-money";

type OrderItemRow = {
  id: number;
  name: string;
  srcUrl: string;
  price: number;
  quantity: number;
  attributes: string[];
  discount?: { percentage: number; amount: number };
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

type Shipping = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pin: string;
};

export function OrderDetailView({ order }: { order: Order }) {
  const items = order.items as unknown as OrderItemRow[];
  const shipping = order.shipping as unknown as Shipping;

  const paidOnline = order.paymentMethod === "online" && order.paymentStatus === "PAID";
  const cod = order.paymentMethod === "cod";

  return (
    <div className="max-w-frame mx-auto px-4 py-10 md:py-14">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/account" className="hover:text-foreground">
          Account
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Order {order.orderNumber}</span>
      </nav>

      <div className="max-w-2xl mb-10">
        <h1
          className={cn(
            integralCF.className,
            "font-bold text-2xl md:text-3xl text-foreground uppercase tracking-tight mb-2"
          )}
        >
          Order details
        </h1>
        <p className="text-muted-foreground text-sm">
          <span className="font-mono font-semibold text-foreground">{order.orderNumber}</span>
          <span className="mx-2">·</span>
          {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          {paidOnline && "Payment received — thank you."}
          {cod && order.paymentStatus === "AWAITING_COD" && "Pay with cash when your order arrives."}
          {order.paymentStatus === "PENDING" && "Waiting for online payment to complete."}
        </p>
      </div>

      <div className="max-w-3xl grid gap-6 md:grid-cols-2 mb-8">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-2">
          <h2 className="font-bold text-foreground">Shipping</h2>
          <p className="text-sm text-foreground/90">
            {shipping.fullName}
            <br />
            {shipping.address}
            <br />
            {shipping.city} {shipping.pin}
            <br />
            {shipping.phone}
            <br />
            <span className="text-muted-foreground">{shipping.email}</span>
          </p>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-2">
          <h2 className="font-bold text-foreground">Payment</h2>
          <p className="text-sm text-foreground/90">
            {order.paymentMethod === "cod" ? "Cash on delivery" : "Online"}
            {order.paymentProvider ? (
              <>
                <br />
                <span className="text-muted-foreground text-xs">Provider: {order.paymentProvider}</span>
              </>
            ) : null}
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatOrderMoney(order.grandTotal, order.currencyCode)}
          </p>
          <p className="text-xs text-muted-foreground">
            Status: {order.paymentStatus} · Order: {order.status}
          </p>
        </section>
      </div>

      <section className="max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm mb-10">
        <h2 className="font-bold text-foreground mb-4">Items</h2>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={`${item.id}-${(item.attributes ?? []).join("-")}`} className="flex gap-4 items-center">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                <Image src={item.srcUrl} alt="" fill className="object-cover" sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(item.attributes ?? []).filter(Boolean).join(" · ")} · Qty {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium tabular-nums">
                {formatOrderMoney(lineRowTotal(item), order.currencyCode)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-4 border-t border-border space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatOrderMoney(order.subtotal, order.currencyCode)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>−{formatOrderMoney(order.discountAmount, order.currencyCode)}</span>
            </div>
          )}
          {order.codFee > 0 && (
            <div className="flex justify-between text-amber-800">
              <span>COD fee</span>
              <span>{formatOrderMoney(order.codFee, order.currencyCode)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-foreground pt-2">
            <span>Total</span>
            <span>{formatOrderMoney(order.grandTotal, order.currencyCode)}</span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/account">← All orders</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
