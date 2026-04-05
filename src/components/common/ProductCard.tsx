"use client";

import React from "react";
import Rating from "../ui/Rating";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product.types";
import { ProductPriceDisplay } from "./ProductPriceDisplay";

type ProductCardProps = {
  data: Product;
};

function pathSlug(data: Product) {
  return (
    data.slug ??
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

const ProductCard = ({ data }: ProductCardProps) => {
  return (
    <Link
      href={`/shop/product/${data.id}/${pathSlug(data)}`}
      className="flex flex-col items-start aspect-auto"
    >
      <div className="bg-muted border border-border/60 shadow-sm rounded-[13px] lg:rounded-[20px] w-full lg:max-w-[295px] aspect-square mb-2.5 xl:mb-4 overflow-hidden">
        <Image
          src={data.srcUrl}
          width={295}
          height={298}
          className="rounded-md w-full h-full object-contain hover:scale-110 transition-all duration-500"
          alt={data.title}
          priority
          unoptimized={data.srcUrl.startsWith("http")}
        />
      </div>
      <strong className="text-foreground xl:text-xl">{data.title}</strong>
      <div className="flex items-end mb-1 xl:mb-2">
        <Rating
          initialValue={data.rating}
          allowFraction
          SVGclassName="inline-block"
          emptyClassName="fill-gray-50"
          size={19}
          readonly
        />
        <span className="text-foreground text-xs xl:text-sm ml-[11px] xl:ml-[13px] pb-0.5 xl:pb-0">
          {data.rating.toFixed(1)}
          <span className="text-muted-foreground">/5</span>
        </span>
      </div>
      <ProductPriceDisplay data={data} size="card" />
    </Link>
  );
};

export default ProductCard;
