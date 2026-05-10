import { AccountOrdersSection } from "@/components/account/AccountOrdersSection";
import { auth } from "@/auth";
import SignOutButton from "@/components/auth/SignOutButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { can, ROLE_LABELS } from "@/lib/rbac";
import { getAdminPortalHref } from "@/lib/site-config";
import type { Role } from "@prisma/client";

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: { ordersPage?: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/account");
  }

  const { user } = session;
  const ordersPageRaw = searchParams?.ordersPage ?? "1";
  const ordersPage = Math.max(1, parseInt(ordersPageRaw, 10) || 1);
  const emailDisplay = user.email?.trim() || "Not provided";
  const role = user.role as Role;
  const showAdminPortal = can(role, "admin:access");
  const adminPortalHref = getAdminPortalHref();
  const adminOpensNewTab = /^https?:\/\//i.test(adminPortalHref);

  return (
    <div className="max-w-frame mx-auto px-4 py-16 md:py-20">
      <nav className="text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Account</span>
      </nav>

      <h1 className="text-3xl font-bold text-foreground mb-2">Your account</h1>
      <p className="text-muted-foreground text-sm mb-10">
        Signed in as{" "}
        <span className="text-foreground font-medium">{emailDisplay}</span>
      </p>

      <div className="max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        {user.name && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p>
            <p className="text-foreground font-medium">{user.name}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
          <p className="text-foreground font-medium">{emailDisplay}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Access role</p>
          <p className="text-foreground font-medium">{ROLE_LABELS[role]}</p>
        </div>
        {showAdminPortal && (
          <div className="flex flex-col gap-3 pt-2">
            <a
              href={adminPortalHref}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              {...(adminOpensNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              Open admin
            </a>
          </div>
        )}
        <div className={showAdminPortal ? "pt-2" : "pt-4"}>
          <SignOutButton />
        </div>
      </div>

      <div className="mt-12 max-w-3xl">
        <AccountOrdersSection userId={user.id!} page={ordersPage} />
      </div>

      <p className="mt-10">
        <Link href="/shop" className="text-primary text-sm font-medium underline-offset-4 hover:underline">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
