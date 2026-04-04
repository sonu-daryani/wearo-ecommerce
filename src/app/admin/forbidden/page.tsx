import Link from "next/link";
import { auth } from "@/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export default async function AdminForbiddenPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "CUSTOMER") as Role;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-foreground mb-2">Admin access required</h1>
      <p className="text-muted-foreground text-center max-w-md mb-2">
        Signed in as {session?.user?.email ?? "—"} with role{" "}
        <span className="font-medium text-foreground">{ROLE_LABELS[role]}</span>.
        CMS and admin tools are limited to Viewer, Editor, or Admin roles.
      </p>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
        Ask an administrator to upgrade your account in the database, then sign out and sign in
        again.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Back to store
        </Link>
        <Link
          href="/account"
          className="rounded-full border border-border px-6 py-2.5 text-sm font-medium"
        >
          Account
        </Link>
      </div>
    </div>
  );
}
