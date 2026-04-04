import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { CmsCreateForm } from "./create-form";

export const metadata = {
  title: "New CMS document",
  robots: { index: false, follow: false },
};

export default async function NewCmsPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!can(role, "cms:write")) {
    redirect("/admin/cms");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New document</h1>
      <CmsCreateForm />
    </div>
  );
}
