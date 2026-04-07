"use client";

import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";
import { cn } from "@/lib/utils";

type Props = {
  editorKey: string;
  /** Saved theme HTML (may include basic rich tags). */
  storedHtml?: string;
  /** Plain default when nothing saved yet. */
  fallbackPlain: string;
  className?: string;
  as?: "span" | "p" | "div";
};

/**
 * Theme-driven copy with `data-editor-key` for the preview bridge.
 * Renders sanitized HTML from DB; falls back to plain text default.
 */
export function EditableHtml({
  editorKey,
  storedHtml,
  fallbackPlain,
  className,
  as: Tag = "span",
}: Props) {
  const raw =
    storedHtml != null && String(storedHtml).trim() !== ""
      ? String(storedHtml)
      : fallbackPlain;
  const safe = sanitizeRichHtml(raw);
  return (
    <Tag
      className={cn(className)}
      data-editor-key={editorKey}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
