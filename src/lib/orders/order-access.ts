type ShippingJson = { email?: string };

/** Signed-in user can view orders linked to their account, or legacy guest orders with matching shipping email. */
export function userCanViewOrder(
  order: { userId: string | null; shipping: unknown },
  sessionUserId: string,
  sessionEmail: string | null | undefined
): boolean {
  if (order.userId) {
    return order.userId === sessionUserId;
  }
  const e = normalizeEmail(sessionEmail);
  if (!e) return false;
  const ship = order.shipping as ShippingJson;
  return normalizeEmail(ship?.email) === e;
}

export function normalizeEmail(s: string | null | undefined): string | null {
  const t = s?.trim().toLowerCase();
  return t || null;
}
