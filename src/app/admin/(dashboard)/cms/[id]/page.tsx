import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function CmsViewPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const role = session?.user?.role as Role;
  const canWrite = can(role, "cms:write");

  const doc = await prisma.cmsDocument.findUnique({
    where: { id: params.id },
    include: { author: { select: { email: true, name: true } } },
  });

  if (!doc) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/cms" className="text-sm text-primary font-medium hover:underline">
          ← All documents
        </Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{doc.title}</h1>
          <p className="text-sm text-slate-500 mt-1 font-mono">{doc.slug}</p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <Link
              href={`/admin/cms/${doc.id}/edit`}
              className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm mb-8 max-w-lg">
        <dt className="text-slate-500">Type</dt>
        <dd className="font-medium">{doc.type}</dd>
        <dt className="text-slate-500">Status</dt>
        <dd className="font-medium">{doc.published ? "Published" : "Draft"}</dd>
        <dt className="text-slate-500">Author</dt>
        <dd className="font-medium">{doc.author.email ?? doc.author.name ?? "—"}</dd>
        <dt className="text-slate-500">Updated</dt>
        <dd className="font-medium">{doc.updatedAt.toLocaleString("en-IN")}</dd>
      </dl>

      {doc.summary && (
        <p className="text-slate-700 border-l-4 border-primary pl-4 mb-6">{doc.summary}</p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Content
        </h2>
        <pre className="whitespace-pre-wrap text-sm text-slate-800 font-mono">{doc.content}</pre>
      </div>
    </div>
  );
}
