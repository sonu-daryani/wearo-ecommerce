import Link from "next/link";
import { auth } from "@/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <Link href="/admin" className="text-lg font-bold text-slate-900">
              Wearo Admin
            </Link>
            <p className="text-xs text-slate-500 mt-1">CMS &amp; access control</p>
          </div>
          <nav className="flex flex-col p-2 gap-0.5">
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/cms"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              CMS documents
            </Link>
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 mt-4"
            >
              ← Storefront
            </Link>
          </nav>
          <div className="mt-auto p-4 border-t border-slate-200 text-xs text-slate-500">
            <p className="font-medium text-slate-700 truncate">{session?.user?.email}</p>
            <p>{role ? ROLE_LABELS[role] : "—"}</p>
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
            <Link href="/admin" className="font-bold">
              Admin
            </Link>
            <Link href="/admin/cms" className="text-sm text-primary font-medium">
              CMS
            </Link>
          </header>
          <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
