import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { reviewsData } from "@/data/homepage";
import { getPublicCompanySettings, themeContentMap } from "@/lib/company-settings";
import { listNewArrivals, listTopSelling } from "@/lib/product-queries";
import { getHomepageVisuals } from "@/lib/site-assets";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [newArrivalsData, topSellingData, visuals, company] = await Promise.all([
    listNewArrivals(),
    listTopSelling(),
    getHomepageVisuals(),
    getPublicCompanySettings(),
  ]);
  const contentText = themeContentMap(company.theme);

  return (
    <>
      <Header
        heroDesktopUrl={visuals.heroDesktop}
        heroMobileUrl={visuals.heroMobile}
        contentText={contentText}
      />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivalsData}
          viewAllLink="/shop#new-arrivals"
          blockId="newArrivals"
          titleKey="newArrivalsHeading"
          viewAllKey="newArrivalsViewAll"
          contentText={contentText}
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSellingData}
            viewAllLink="/shop#top-selling"
            blockId="topSelling"
            titleKey="topSellingHeading"
            viewAllKey="topSellingViewAll"
            contentText={contentText}
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <DressStyle dressImageUrls={visuals.dressStyle} contentText={contentText} />
        </div>
        <Reviews data={reviewsData} contentText={contentText} />
      </main>
    </>
  );
}
