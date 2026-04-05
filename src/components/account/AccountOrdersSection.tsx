import Link from "next/link";
import { listOrdersForAccount } from "@/lib/orders/list-account-orders";
import { formatOrderMoney } from "./format-order-money";

function statusLabel(paymentStatus: string, paymentMethod: string) {
  if (paymentMethod === "cod" && paymentStatus === "AWAITING_COD") return "Awaiting COD";
  if (paymentStatus === "PAID") return "Paid";
  if (paymentStatus === "PENDING") return "Payment pending";
  if (paymentStatus === "FAILED") return "Failed";
  return paymentStatus;
}

export async function AccountOrdersSection({ userId }: { userId: string }) {
  const orders = await listOrdersForAccount(userId);

  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-2">Your orders</h2>
        <p className="text-sm text-muted-foreground">
          No orders yet. When you check out while signed in, your orders will appear here. You can always open your
          confirmation link from email as well.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Your orders</h2>
        <p className="text-xs text-muted-foreground mt-1">{orders.length} order{orders.length === 1 ? "" : "s"}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Payment</th>
              <th className="px-4 py-3 font-medium text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.publicToken} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <span className="font-mono font-medium text-foreground">{o.orderNumber}</span>
                  <span className="sm:hidden block text-xs text-muted-foreground mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {new Date(o.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 font-medium tabular-nums">
                  {formatOrderMoney(o.grandTotal, o.currencyCode)}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {statusLabel(o.paymentStatus, o.paymentMethod)}
                  {o.paymentProvider ? (
                    <span className="block text-xs text-muted-foreground/80">{o.paymentProvider}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/account/orders/${encodeURIComponent(o.publicToken)}`}
                    className="text-primary text-sm font-medium underline-offset-4 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
