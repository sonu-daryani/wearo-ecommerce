/** Plain text for places that cannot render HTML (e.g. mobile menu title). */
export function stripHtmlTags(html: string): string {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
