import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  /** Last breadcrumb segment if different from `title` (optional). */
  breadcrumbCurrent?: string;
  description?: string;
  children: React.ReactNode;
  /** Extra breadcrumb segment after Home (e.g. "Help"). */
  breadcrumbParent?: { label: string; href: string };
};

export function MarketingPage({
  title,
  breadcrumbCurrent,
  description,
  children,
  breadcrumbParent,
}: Props) {
  const crumb = breadcrumbCurrent ?? title;

  return (
    <main className="max-w-frame mx-auto px-4 py-14 md:py-20">
      <nav className="mb-8 text-sm text-black/50" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        {breadcrumbParent && (
          <>
            <span className="mx-2">/</span>
            <Link href={breadcrumbParent.href} className="hover:text-black">
              {breadcrumbParent.label}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-black">{crumb}</span>
      </nav>

      <header className="max-w-3xl border-b border-black/10 pb-8 mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-4 text-lg leading-relaxed text-black/60">{description}</p>
        )}
      </header>

      <div className="max-w-3xl space-y-6 text-base leading-relaxed text-black/70 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-black [&_h2]:first:mt-0 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-black [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-black/80">
        {children}
      </div>
    </main>
  );
}

export function MarketingLead({ children }: { children: ReactNode }) {
  return <p className="text-lg leading-relaxed text-black/75">{children}</p>;
}
