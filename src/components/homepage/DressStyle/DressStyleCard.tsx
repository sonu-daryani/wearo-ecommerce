import { EditableHtml } from "@/components/editor/EditableHtml";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type DressStyleCardProps = {
  title: string;
  url: string;
  imageUrl: string;
  className?: string;
  titleKey?: string;
  contentText?: Record<string, string>;
};

const DressStyleCard = ({ title, url, imageUrl, className, titleKey, contentText = {} }: DressStyleCardProps) => {
  return (
    <Link
      href={url}
      style={{ backgroundImage: `url(${JSON.stringify(imageUrl)})` }}
      className={cn([
        "w-full md:h-full rounded-[20px] bg-card border border-border shadow-sm text-foreground bg-top text-2xl md:text-4xl font-bold text-left py-4 md:py-[25px] px-6 md:px-9 bg-no-repeat bg-cover",
        className,
      ])}
    >
      {titleKey ? (
        <EditableHtml editorKey={titleKey} storedHtml={contentText[titleKey]} fallbackPlain={title} />
      ) : (
        title
      )}
    </Link>
  );
};

export default DressStyleCard;
