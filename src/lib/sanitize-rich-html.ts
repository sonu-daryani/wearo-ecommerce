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
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "hr",
    "s",
    "del",
    "section",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "class"],
    span: ["style", "class"],
    p: ["style", "class"],
    div: ["style", "class"],
    ul: ["class"],
    ol: ["class"],
    li: ["class"],
    strong: ["class"],
    section: ["id", "class"],
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
      if (attribs.class) out.class = attribs.class;
      return { tagName: "a", attribs: out };
    },
  },
};

export function sanitizeRichHtml(dirty: string): string {
  const s = (dirty ?? "").trim();
  if (!s) return "";
  return sanitizeHtml(s, RICH_TEXT_OPTS);
}
