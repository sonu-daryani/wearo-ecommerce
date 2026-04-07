import sanitizeHtml from "sanitize-html";

const RICH_TEXT_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "b",
    "i",
    "em",
    "strong",
    "u",
    "br",
    "p",
    "span",
    "a",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "div",
    "font",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: ["style"],
    p: ["style"],
    div: ["style"],
    font: ["color", "size", "face"],
  },
  allowedStyles: {
    "*": {
      color: [/^#[0-9a-fA-F]{3,8}$/i, /^rgb\(/i, /^hsl\(/i, /^var\(/i],
      "font-size": [/^\d+(?:\.\d+)?(?:px|rem|em|%)$/],
      "font-weight": [/^(bold|normal|bolder|lighter|\d{3})$/i],
      "text-decoration": [/^(underline|line-through|none)$/i],
    },
  },
  transformTags: {
    a: (tagName, attribs) => {
      const out: Record<string, string> = {
        href: attribs.href || "#",
        rel: "noopener noreferrer",
      };
      if (attribs.target === "_blank") out.target = "_blank";
      return { tagName: "a", attribs: out };
    },
  },
};

/** Safe HTML for themed copy (CMS). Strip scripts, event handlers, bad URLs. */
export function sanitizeRichHtml(dirty: string): string {
  const s = (dirty ?? "").trim();
  if (!s) return "";
  return sanitizeHtml(s, RICH_TEXT_OPTS);
}
