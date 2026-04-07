import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

const TOOLBAR_ID = "wearo-store-rich-toolbar";

function ensureToolbar(): HTMLDivElement {
  let bar = document.getElementById(TOOLBAR_ID) as HTMLDivElement | null;
  if (bar) return bar;
  bar = document.createElement("div");
  bar.id = TOOLBAR_ID;
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", "Rich text");
  if (!bar.dataset.hoverBound) {
    bar.dataset.hoverBound = "1";
    bar.addEventListener("mouseenter", cancelHideRichTextToolbar);
    bar.addEventListener("mouseleave", scheduleHideRichTextToolbar);
  }

  bar.style.cssText = [
    "position:fixed",
    "left:50%",
    "bottom:10px",
    "transform:translateX(-50%)",
    "z-index:2147483647",
    "display:none",
    "flex-wrap:wrap",
    "align-items:center",
    "gap:6px",
    "padding:8px 10px",
    "border-radius:10px",
    "background:#fff",
    "border:1px solid #e2e8f0",
    "box-shadow:0 10px 40px rgba(15,23,42,0.18)",
    "font-family:system-ui,sans-serif",
    "font-size:12px",
    "max-width:calc(100vw - 24px)",
  ].join(";");
  document.body.appendChild(bar);
  return bar;
}

function btn(label: string, title: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.title = title;
  b.style.cssText =
    "padding:4px 8px;border-radius:6px;border:1px solid #cbd5e1;background:#f8fafc;cursor:pointer;font-weight:600;";
  b.addEventListener("mousedown", (e) => e.preventDefault());
  b.addEventListener("click", (e) => {
    e.preventDefault();
    onClick();
  });
  return b;
}

function labelEl(text: string): HTMLSpanElement {
  const s = document.createElement("span");
  s.textContent = text;
  s.style.cssText = "color:#64748b;font-weight:600;margin-right:2px;";
  return s;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export function hideRichTextToolbar() {
  const bar = document.getElementById(TOOLBAR_ID) as HTMLDivElement | null;
  if (bar) bar.style.display = "none";
}

export function showRichTextToolbarFor(_activeHost: HTMLElement) {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  try {
    document.execCommand("styleWithCSS", false, "true");
  } catch {
    /* ignore */
  }

  const bar = ensureToolbar();
  bar.innerHTML = "";
  bar.style.display = "flex";

  bar.appendChild(labelEl("Style"));

  bar.appendChild(
    btn("B", "Bold", () => {
      document.execCommand("bold", false);
    })
  );
  bar.appendChild(
    btn("I", "Italic", () => {
      document.execCommand("italic", false);
    })
  );
  bar.appendChild(
    btn("U", "Underline", () => {
      document.execCommand("underline", false);
    })
  );

  const color = document.createElement("input");
  color.type = "color";
  color.title = "Text color";
  color.value = "#111827";
  color.style.cssText = "width:32px;height:28px;padding:0;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;";
  color.addEventListener("mousedown", (e) => e.preventDefault());
  color.addEventListener("input", () => {
    document.execCommand("foreColor", false, color.value);
  });
  bar.appendChild(color);

  const size = document.createElement("select");
  size.title = "Font size";
  size.style.cssText =
    "padding:4px 6px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;max-width:120px;";
  [
    ["", "Size"],
    ["14px", "14px"],
    ["16px", "16px"],
    ["18px", "18px"],
    ["20px", "20px"],
    ["24px", "24px"],
    ["32px", "32px"],
    ["40px", "40px"],
  ].forEach(([v, lab]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = lab;
    size.appendChild(o);
  });
  size.addEventListener("mousedown", (e) => e.preventDefault());
  size.addEventListener("change", () => {
    const px = size.value;
    size.selectedIndex = 0;
    if (!px) return;
    wrapSelectionWithStyle("fontSize", px);
  });
  bar.appendChild(size);

  bar.appendChild(
    btn("A+", "Larger text", () => {
      wrapSelectionWithStyle("fontSize", "1.25em");
    })
  );
  bar.appendChild(
    btn("A−", "Smaller text", () => {
      wrapSelectionWithStyle("fontSize", "0.88em");
    })
  );

  bar.appendChild(
    btn("Link", "Insert link", () => {
      const url = window.prompt("Link URL (https://…)", "https://");
      if (!url?.trim()) return;
      document.execCommand("createLink", false, url.trim());
    })
  );

  bar.appendChild(
    btn("Unlink", "Remove link", () => {
      document.execCommand("unlink", false);
    })
  );

  bar.appendChild(
    btn("Clear", "Clear formatting", () => {
      document.execCommand("removeFormat", false);
      document.execCommand("unlink", false);
    })
  );
}

export function scheduleHideRichTextToolbar() {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    hideRichTextToolbar();
    hideTimer = null;
  }, 200);
}

export function cancelHideRichTextToolbar() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

export function destroyRichTextToolbar() {
  document.getElementById(TOOLBAR_ID)?.remove();
}

/** Serialize editable region for postMessage + DB. */
export function serializeEditableHtml(el: HTMLElement): string {
  return sanitizeRichHtml(el.innerHTML);
}

function wrapSelectionWithStyle(property: string, value: string) {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  const r = sel.getRangeAt(0);
  if (r.collapsed) return;
  const span = document.createElement("span");
  span.style.setProperty(property, value);
  try {
    span.appendChild(r.extractContents());
    r.insertNode(span);
    sel.removeAllRanges();
    const nr = document.createRange();
    nr.selectNodeContents(span);
    nr.collapse(false);
    sel.addRange(nr);
  } catch {
    /* ignore */
  }
}
