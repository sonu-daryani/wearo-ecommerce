import { EditableHtml } from "@/components/editor/EditableHtml";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import React from "react";

type NewsLetterSectionProps = {
  contentText?: Record<string, string>;
};

const NEWSLETTER_HEADING_FALLBACK =
  "STAY UP TO DATE ABOUT OUR LATEST OFFERS";
const NEWSLETTER_EMAIL_PLACEHOLDER_FALLBACK = "Enter your email address";
const NEWSLETTER_CTA_FALLBACK = "Subscribe to Newsletter";

const NewsLetterSection = ({ contentText = {} }: NewsLetterSectionProps) => {
  const emailPlaceholder =
    contentText.newsletterEmailPlaceholder?.trim() ||
    NEWSLETTER_EMAIL_PLACEHOLDER_FALLBACK;
  return (
    <div
      className="relative grid grid-cols-1 md:grid-cols-2 py-9 md:py-11 px-6 md:px-16 max-w-frame mx-auto bg-black rounded-[20px]"
      data-editor-block="newsletter"
    >
      <p
        className={cn([
          integralCF.className,
          "font-bold text-[32px] md:text-[40px] text-white mb-9 md:mb-0",
        ])}
      >
        <EditableHtml
          editorKey="newsletterHeading"
          storedHtml={contentText.newsletterHeading}
          fallbackPlain={NEWSLETTER_HEADING_FALLBACK}
        />
      </p>
      <div className="flex items-center">
        <div className="flex flex-col w-full max-w-[349px] mx-auto">
          <InputGroup className="flex bg-white mb-[14px]">
            <InputGroup.Text>
              <Image
                priority
                src="/icons/envelope.svg"
                height={20}
                width={20}
                alt="email"
                className="min-w-5 min-h-5"
              />
            </InputGroup.Text>
            <InputGroup.Input
              type="email"
              name="email"
              placeholder={emailPlaceholder}
              className="bg-transparent placeholder:text-black/40 placeholder:text-sm sm:placeholder:text-base"
            />
          </InputGroup>
          <Button
            variant="secondary"
            className="text-sm sm:text-base font-medium bg-white h-12 rounded-full px-4 py-3"
            aria-label="Subscribe to Newsletter"
            type="button"
          >
            <EditableHtml
              editorKey="newsletterCta"
              storedHtml={contentText.newsletterCta}
              fallbackPlain={NEWSLETTER_CTA_FALLBACK}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsLetterSection;
