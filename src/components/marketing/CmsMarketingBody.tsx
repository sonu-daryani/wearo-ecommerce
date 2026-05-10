import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

/** Renders sanitized CMS HTML inside `MarketingPage` body wrapper. */
export function CmsMarketingBody({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }} />;
}
