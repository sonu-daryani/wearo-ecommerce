import type { ReactNode } from "react";
import { getPublishedMarketingPage } from "@/lib/cms-marketing";
import { CmsMarketingBody } from "./CmsMarketingBody";
import { MarketingPage } from "./MarketingPage";

type MarketingPageBaseProps = {
  title: string;
  breadcrumbCurrent?: string;
  description?: string;
  breadcrumbParent?: { label: string; href: string };
};

type Props = MarketingPageBaseProps & {
  /** Must match admin / CMS (`cms-storefront-pages` slugs). */
  slug: string;
  children: ReactNode;
};

/**
 * If a published CMS document exists for `slug`, renders its title/summary/body.
 * Otherwise renders the static `children` with the given title/description.
 */
export async function MarketingPageWithCms({
  slug,
  title,
  description,
  breadcrumbCurrent,
  breadcrumbParent,
  children,
}: Props) {
  const cms = await getPublishedMarketingPage(slug);
  const useCms = Boolean(cms?.content?.trim());

  return (
    <MarketingPage
      title={useCms ? cms!.title : title}
      description={useCms ? cms!.summary ?? description : description}
      breadcrumbCurrent={breadcrumbCurrent}
      breadcrumbParent={breadcrumbParent}
    >
      {useCms ? <CmsMarketingBody html={cms!.content} /> : children}
    </MarketingPage>
  );
}
