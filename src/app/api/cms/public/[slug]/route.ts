import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/** Public read-only CMS by slug (published only). For storefront / headless use. */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug?.toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = await prisma.cmsDocument.findFirst({
    where: { slug, published: true },
    select: {
      slug: true,
      title: true,
      summary: true,
      content: true,
      type: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
}
