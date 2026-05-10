"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/** Shared with login & register — matches shadcn inputs + strong focus ring. */
export const authInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 ring-offset-white focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:ring-offset-slate-950 dark:focus-visible:ring-white/20";

export const authPrimaryCtaClass =
  "h-12 w-full rounded-full border-0 bg-slate-900 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:shadow-white/10 dark:hover:bg-slate-100 dark:focus-visible:ring-white";

export const authCardClass =
  "rounded-2xl border border-slate-200/95 bg-white p-8 shadow-[0_24px_56px_-16px_rgba(15,23,42,0.2)] backdrop-blur-sm dark:border-slate-700/90 dark:bg-slate-950/90 dark:shadow-black/40 sm:p-10";

export function ContinueShoppingLink() {
  return (
    <div className="flex justify-center">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        Continue shopping
      </Link>
    </div>
  );
}

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-background to-sky-50 dark:from-slate-950 dark:via-background dark:to-slate-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(at 0% 0%, hsl(var(--primary) / 0.12) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsl(199 89% 48% / 0.1) 0px, transparent 45%)`,
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.45)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.45)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_45%,transparent)] dark:opacity-40" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-14 sm:py-16">
        {children}
      </div>
    </div>
  );
}
