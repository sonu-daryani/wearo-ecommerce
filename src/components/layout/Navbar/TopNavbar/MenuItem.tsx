import * as React from "react";
import Link from "next/link";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { EditableHtml } from "@/components/editor/EditableHtml";
import { cn } from "@/lib/utils";

type MenuItemProps = {
  label: string;
  url?: string;
  labelKey?: string;
  contentText?: Record<string, string>;
};

export function MenuItem({ label, url, labelKey, contentText = {} }: MenuItemProps) {
  return (
    <NavigationMenuItem>
      <Link href={url ?? "/"} legacyBehavior passHref>
        <NavigationMenuLink
          className={cn([navigationMenuTriggerStyle(), "font-normal px-3"])}
        >
          {labelKey ? (
            <EditableHtml
              editorKey={labelKey}
              storedHtml={contentText[labelKey]}
              fallbackPlain={label}
            />
          ) : (
            label
          )}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
}
