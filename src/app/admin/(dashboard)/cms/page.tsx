import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { DeleteCmsButton } from "./delete-cms-button";

export const metadata = {
  title: "CMS",
  robots: { index: false, follow: false },
};

export default async function AdminCmsListPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  const canWrite = can(role, "cms:write");
  const canDelete = can(role, "cms:delete");

  const docs = await prisma.cmsDocument.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { email: true, name: true } } },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CMS documents</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage pages, announcements, and banner copy. Published entries are available via{" "}
            <code className="text-xs bg-slate-200 px-1 rounded">/api/cms/public/[slug]</code>
          </p>
        </div>
        {canWrite && (
          <Link
            href="/admin/cms/new"
            className="rounded-full bg-slate-900 text-white px-5 py-2.5 text-sm font-medium text-center hover:bg-slate-800"
          >
            New document
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No documents yet.
                    {canWrite && (
                      <>
                        {" "}
                        <Link href="/admin/cms/new" className="text-primary font-medium underline">
                          Create one
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                docs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{d.title}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{d.slug}</td>
                    <td className="px-4 py-3 text-slate-600">{d.type}</td>
                    <td className="px-4 py-3">
                      {d.published ? (
                        <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-medium">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-medium">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {d.updatedAt.toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/admin/cms/${d.id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        View
                      </Link>
                      {canWrite && (
                        <Link
                          href={`/admin/cms/${d.id}/edit`}
                          className="text-slate-700 font-medium hover:underline"
                        >
                          Edit
                        </Link>
                      )}
                      {canDelete && <DeleteCmsButton id={d.id} />}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
