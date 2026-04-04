import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: `Review your bag and checkout securely on ${SITE_NAME}.`,
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
