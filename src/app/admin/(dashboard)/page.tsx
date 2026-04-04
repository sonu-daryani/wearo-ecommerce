import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can, ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export default async function AdminHomePage() {
  const session = await auth();
  const role = session?.user?.role as Role;

  const [totalDocs, publishedDocs] = await Promise.all([
    prisma.cmsDocument.count(),
    prisma.cmsDocument.count({ where: { published: true } }),
  ]);

  const canWrite = can(role, "cms:write");
  const canDelete = can(role, "cms:delete");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h1>
      <p className="text-slate-600 text-sm mb-8">
        Signed in as <span className="font-medium">{session?.user?.email}</span> —{" "}
        {ROLE_LABELS[role]}.
      </p>

      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">CMS entries</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{totalDocs}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Published</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{publishedDocs}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Your permissions</p>
          <ul className="mt-2 text-sm text-slate-700 space-y-1">
            <li>{can(role, "cms:read") ? "✓ Read" : "— Read"}</li>
            <li>{canWrite ? "✓ Write / publish" : "— Write"}</li>
            <li>{canDelete ? "✓ Delete" : "— Delete (admin)"}</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/cms"
            className="rounded-full bg-slate-900 text-white px-5 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Open CMS
          </Link>
          {canWrite && (
            <Link
              href="/admin/cms/new"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-50"
            >
              New document
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
