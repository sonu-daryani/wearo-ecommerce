import React from "react";
import * as motion from "framer-motion/client";
import { EditableHtml } from "@/components/editor/EditableHtml";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product.types";
import Link from "next/link";

type ProductListSecProps = {
  title: string;
  data: Product[];
  viewAllLink?: string;
  blockId?: string;
  titleKey?: string;
  viewAllKey?: string;
  contentText?: Record<string, string>;
};

const ProductListSec = ({
  title,
  data,
  viewAllLink,
  blockId,
  titleKey,
  viewAllKey,
  contentText = {},
}: ProductListSecProps) => {
  const resolvedTitle =
    (titleKey ? contentText[titleKey]?.trim() : "") || title;
  const resolvedViewAll =
    (viewAllKey ? contentText[viewAllKey]?.trim() : "") || "View All";
  return (
    <section className="max-w-frame mx-auto text-center" data-editor-block={blockId}>
      <motion.h2
        initial={{ y: "100px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={cn([
          integralCF.className,
          "text-[32px] md:text-5xl mb-8 md:mb-14 capitalize",
        ])}
      >
        {titleKey ? (
          <EditableHtml editorKey={titleKey} storedHtml={contentText[titleKey]} fallbackPlain={title} />
        ) : (
          title
        )}
      </motion.h2>
      <motion.div
        initial={{ y: "100px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full mb-6 md:mb-9"
        >
          <CarouselContent className="mx-4 xl:mx-0 space-x-4 sm:space-x-5">
            {data.map((product) => (
              <CarouselItem
                key={product.id}
                className="w-full max-w-[198px] sm:max-w-[295px] pl-0"
              >
                <ProductCard data={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {viewAllLink && (
          <div className="w-full px-4 sm:px-0 text-center">
            <Link
              href={viewAllLink}
              className="w-full inline-block sm:w-[218px] px-[54px] py-4 border rounded-full hover:bg-black hover:text-white text-black transition-all font-medium text-sm sm:text-base border-black/10"
            >
              {viewAllKey ? (
                <EditableHtml
                  editorKey={viewAllKey}
                  storedHtml={contentText[viewAllKey]}
                  fallbackPlain="View All"
                />
              ) : (
                "View All"
              )}
            </Link>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ProductListSec;
