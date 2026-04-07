import { EditableHtml } from "@/components/editor/EditableHtml";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import React from "react";
import * as motion from "framer-motion/client";
import DressStyleCard from "./DressStyleCard";

type DressStyleProps = {
  dressImageUrls: [string, string, string, string];
  contentText?: Record<string, string>;
};

const DRESS_STYLE_HEADING_FALLBACK = "BROWSE BY dress STYLE";

const DressStyle = ({ dressImageUrls, contentText = {} }: DressStyleProps) => {
  return (
    <div className="px-4 xl:px-0">
      <section
        className="max-w-frame mx-auto bg-[#F0F0F0] px-6 pb-6 pt-10 md:p-[70px] rounded-[40px] text-center"
        data-editor-block="dressStyle"
      >
        <motion.h2
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={cn([
            integralCF.className,
            "text-[32px] leading-[36px] md:text-5xl mb-8 md:mb-14 capitalize",
          ])}
        >
          <EditableHtml
            editorKey="dressStyleHeading"
            storedHtml={contentText.dressStyleHeading}
            fallbackPlain={DRESS_STYLE_HEADING_FALLBACK}
          />
        </motion.h2>
        <motion.div
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row md:h-[289px] space-y-4 sm:space-y-0 sm:space-x-5 mb-4 sm:mb-5"
        >
          <DressStyleCard
            title="Casual"
            url="/shop#casual"
            imageUrl={dressImageUrls[0]}
            className="md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px]"
            titleKey="dressStyleCasual"
            contentText={contentText}
          />
          <DressStyleCard
            title="Formal"
            url="/shop#formal"
            imageUrl={dressImageUrls[1]}
            className="md:max-w-[684px] h-[190px]"
            titleKey="dressStyleFormal"
            contentText={contentText}
          />
        </motion.div>
        <motion.div
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row md:h-[289px] space-y-5 sm:space-y-0 sm:space-x-5"
        >
          <DressStyleCard
            title="Party"
            url="/shop#party"
            imageUrl={dressImageUrls[2]}
            className="md:max-w-[684px] h-[190px]"
            titleKey="dressStyleParty"
            contentText={contentText}
          />
          <DressStyleCard
            title="Gym"
            url="/shop#gym"
            imageUrl={dressImageUrls[3]}
            className="md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px]"
            titleKey="dressStyleGym"
            contentText={contentText}
          />
        </motion.div>
      </section>
    </div>
  );
};

export default DressStyle;
