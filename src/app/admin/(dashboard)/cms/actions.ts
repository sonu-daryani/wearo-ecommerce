"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import type { CmsType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string };

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseType(raw: FormDataEntryValue | null): CmsType {
  const v = String(raw ?? "PAGE").toUpperCase();
  if (v === "ANNOUNCEMENT" || v === "BANNER_COPY") return v;
  return "PAGE";
}

export async function createCmsDocument(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id || !can(session.user.role, "cms:write")) {
    return { error: "You do not have permission to create content." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim().toLowerCase();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "");
  const type = parseType(formData.get("type"));
  const published = formData.get("published") === "on";

  if (!title) return { error: "Title is required." };
  const slug = slugInput || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  if (!SLUG_REGEX.test(slug)) {
    return {
      error:
        "Slug must be lowercase letters, numbers, and hyphens only (e.g. summer-sale).",
    };
  }

  try {
    await prisma.cmsDocument.create({
      data: {
        slug,
        title,
        summary,
        content,
        type,
        published,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
      },
    });
  } catch {
    return { error: "Could not save. The slug may already exist." };
  }

  revalidatePath("/admin/cms");
  redirect("/admin/cms");
}

export async function updateCmsDocument(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id || !can(session.user.role, "cms:write")) {
    return { error: "You do not have permission to edit content." };
  }

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim().toLowerCase();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "");
  const type = parseType(formData.get("type"));
  const published = formData.get("published") === "on";

  if (!id) return { error: "Missing document id." };
  if (!title) return { error: "Title is required." };
  const slug = slugInput || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  if (!SLUG_REGEX.test(slug)) {
    return {
      error:
        "Slug must be lowercase letters, numbers, and hyphens only (e.g. summer-sale).",
    };
  }

  const existing = await prisma.cmsDocument.findUnique({ where: { id } });
  if (!existing) return { error: "Document not found." };

  try {
    await prisma.cmsDocument.update({
      where: { id },
      data: {
        slug,
        title,
        summary,
        content,
        type,
        published,
        publishedAt: published ? existing.publishedAt ?? new Date() : null,
      },
    });
  } catch {
    return { error: "Could not save. The slug may be taken by another page." };
  }

  revalidatePath("/admin/cms");
  revalidatePath(`/admin/cms/${id}/edit`);
  redirect("/admin/cms");
}

export async function deleteCmsDocument(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id || !can(session.user.role, "cms:delete")) {
    return { error: "Only administrators can delete documents." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing document." };

  try {
    await prisma.cmsDocument.delete({ where: { id } });
  } catch {
    return { error: "Could not delete document." };
  }

  revalidatePath("/admin/cms");
  redirect("/admin/cms");
}
