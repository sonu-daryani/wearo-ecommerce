import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { reviewsData } from "@/data/homepage";
import { listNewArrivals, listTopSelling } from "@/lib/product-queries";
import { getHomepageVisuals } from "@/lib/site-assets";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [newArrivalsData, topSellingData, visuals] = await Promise.all([
    listNewArrivals(),
    listTopSelling(),
    getHomepageVisuals(),
  ]);

  return (
    <>
      <Header heroDesktopUrl={visuals.heroDesktop} heroMobileUrl={visuals.heroMobile} />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivalsData}
          viewAllLink="/shop#new-arrivals"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSellingData}
            viewAllLink="/shop#top-selling"
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <DressStyle dressImageUrls={visuals.dressStyle} />
        </div>
        <Reviews data={reviewsData} />
      </main>
    </>
  );
}
