import {
  relatedProductData,
} from "@/data/homepage";
import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  absoluteUrl,
  SITE_NAME,
} from "@/lib/site-config";
import {
  getProductById,
  productDisplayPrice,
} from "@/lib/products";

type Props = {
  params: { slug: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = Number(params.slug?.[0]);
  const product = getProductById(id);
  if (!product) {
    return { title: "Product" };
  }

  const price = productDisplayPrice(product);
  const description = `${product.title} — ${price}. Shop quality fashion on Wearo.in with delivery across India. Rated ${product.rating.toFixed(1)} out of 5.`;
  const path = `/shop/product/${params.slug.join("/")}`;

  const ogImage = `/api/og/product/${id}`;

  return {
    title: product.title,
    description,
    openGraph: {
      title: `${product.title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: absoluteUrl(path),
    },
  };
}

export default function ProductPage({ params }: Props) {
  const productData = getProductById(Number(params.slug?.[0]));

  if (!productData?.title) {
    notFound();
  }

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={productData.title} />
        <section className="mb-11">
          <Header data={productData} />
        </section>
        <Tabs />
      </div>
      <div className="mb-[50px] sm:mb-20">
        <ProductListSec title="You might also like" data={relatedProductData} />
      </div>
    </main>
  );
}
