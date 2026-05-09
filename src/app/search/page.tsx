import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

/** Navbar mobile icon links here; catalog browsing lives at `/shop`. */
export default function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams.q;
  const q = typeof raw === "string" ? raw.trim() : "";
  if (q) {
    redirect(`/shop?q=${encodeURIComponent(q)}`);
  }
  redirect("/shop");
}
