import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { CmsEditForm } from "./edit-form";

export const metadata = {
  title: "Edit CMS",
  robots: { index: false, follow: false },
};

export default async function CmsEditPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!can(role, "cms:write")) {
    redirect(`/admin/cms/${params.id}`);
  }

  const doc = await prisma.cmsDocument.findUnique({
    where: { id: params.id },
  });

  if (!doc) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/cms/${doc.id}`} className="text-sm text-primary font-medium hover:underline">
          ← View document
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit document</h1>
      <CmsEditForm doc={doc} />
    </div>
  );
}
