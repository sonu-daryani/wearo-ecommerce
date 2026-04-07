"use client";

import { useEffect } from "react";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";
import {
  cancelHideRichTextToolbar,
  destroyRichTextToolbar,
  hideRichTextToolbar,
  scheduleHideRichTextToolbar,
  serializeEditableHtml,
  showRichTextToolbarFor,
} from "./rich-text-toolbar";

type ThemeMap = Record<string, string> | null | undefined;

function applyTheme(theme: ThemeMap) {
  if (!theme) return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme)) {
    if (k.startsWith("--") && v.trim()) {
      root.style.setProperty(k, v.trim());
    }
  }
  for (const [k, v] of Object.entries(theme)) {
    if (!k.startsWith("content.") || !String(v).trim()) continue;
    const key = k.replace("content.", "");
    const els = document.querySelectorAll<HTMLElement>(`[data-editor-key="${key}"]`);
    els.forEach((el) => {
      if (document.activeElement === el) return;
      el.innerHTML = sanitizeRichHtml(String(v));
    });
  }
}

function isEditorPreview(): boolean {
  try {
    return new URLSearchParams(window.location.search).get("editorPreview") === "1";
  } catch {
    return false;
  }
}

function pushContentKey(el: HTMLElement) {
  const key = el.dataset.editorKey || "";
  if (!key) return;
  const value = serializeEditableHtml(el);
  window.parent?.postMessage({ type: "editor:contentChange", key, value }, "*");
}

/** Double-click turns on editing; blur turns it off. Rich HTML is synced to parent. */
function attachKeyedEditors() {
  const els = document.querySelectorAll<HTMLElement>("[data-editor-key]");
  const disposers: (() => void)[] = [];

  els.forEach((el) => {
    el.contentEditable = "false";
    el.spellcheck = false;
    el.dataset.editorEditable = "1";
    el.style.cursor = "text";
    el.style.outline = "2px dashed transparent";
    el.style.outlineOffset = "2px";
    el.title = "Double-click to edit rich text";

    const key = el.dataset.editorKey || "";
    if (!key) return;

    const onFocus = () => {
      el.style.outlineColor = "rgba(99,102,241,0.8)";
      showRichTextToolbarFor(el);
      cancelHideRichTextToolbar();
    };
    const onBlur = () => {
      el.style.outlineColor = "transparent";
      el.contentEditable = "false";
      pushContentKey(el);
      scheduleHideRichTextToolbar();
    };
    const onInput = () => {
      if (el.isContentEditable) pushContentKey(el);
    };

    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", onBlur);
    el.addEventListener("input", onInput);

    disposers.push(() => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
      el.removeEventListener("input", onInput);
    });
  });

  return () => disposers.forEach((d) => d());
}

function enableBlockSelectionAndSafeNavigation(): () => void {
  const blocks = document.querySelectorAll<HTMLElement>("[data-editor-block]");
  blocks.forEach((block) => {
    block.style.outline = "1px solid transparent";
    block.style.outlineOffset = "2px";
  });

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const editableHost = target.closest("[data-editor-key]");
    const anchor = target.closest("a");
    if (editableHost && anchor) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (anchor) {
      if (e.detail < 2) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    const block = target.closest<HTMLElement>("[data-editor-block]");
    if (!block) return;
    document
      .querySelectorAll<HTMLElement>("[data-editor-block]")
      .forEach((el) => (el.style.outlineColor = "transparent"));
    block.style.outlineColor = "rgba(16,185,129,0.9)";
    window.parent?.postMessage(
      { type: "editor:blockSelect", block: block.dataset.editorBlock ?? "" },
      "*"
    );
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}

export default function StorefrontEditorBridge({ initialTheme }: { initialTheme: ThemeMap }) {
  useEffect(() => {
    applyTheme(initialTheme);
    let detachEditors: (() => void) | undefined;
    let detachBlockNav: (() => void) | undefined;
    let detachDocInput: (() => void) | undefined;
    let detachDblClick: (() => void) | undefined;
    if (isEditorPreview()) {
      detachEditors = attachKeyedEditors();
      detachBlockNav = enableBlockSelectionAndSafeNavigation();

      const onDocInput = (e: Event) => {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
        const host = t.closest<HTMLElement>("[data-editor-key]");
        if (!host?.isContentEditable) return;
        pushContentKey(host);
      };
      document.addEventListener("input", onDocInput, true);
      detachDocInput = () => document.removeEventListener("input", onDocInput, true);

      const onDblClick = (e: MouseEvent) => {
        const t = e.target as HTMLElement | null;
        if (!t) return;
        const el = t.closest<HTMLElement>("[data-editor-key]");
        if (!el) return;
        e.preventDefault();
        e.stopPropagation();
        el.contentEditable = "true";
        el.focus();
      };
      document.addEventListener("dblclick", onDblClick, true);
      detachDblClick = () => document.removeEventListener("dblclick", onDblClick, true);
    }

    const onMessage = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        theme?: ThemeMap;
        selectedBlock?: string;
        previewScreen?: "mobile" | "tablet" | "desktop";
      };
      if (data?.type !== "editor:update") return;
      applyTheme(data.theme);
      if (isEditorPreview() && data.previewScreen) {
        document.documentElement.dataset.editorPreviewScreen = data.previewScreen;
      }
      if (data.selectedBlock) {
        document
          .querySelectorAll<HTMLElement>("[data-editor-block]")
          .forEach((el) => (el.style.outlineColor = "transparent"));
        const selected = document.querySelector<HTMLElement>(
          `[data-editor-block="${data.selectedBlock}"]`
        );
        if (selected) {
          selected.style.outlineColor = "rgba(16,185,129,0.9)";
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      detachEditors?.();
      detachBlockNav?.();
      detachDocInput?.();
      detachDblClick?.();
      hideRichTextToolbar();
      destroyRichTextToolbar();
    };
  }, [initialTheme]);

  return null;
}
