"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createCmsDocument, type FormState } from "../actions";
import Link from "next/link";

const initial: FormState = {};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function CmsCreateForm() {
  const [state, action] = useFormState(createCmsDocument, initial);

  return (
    <form action={action} className="max-w-2xl space-y-5">
      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Title *
        </label>
        <input
          id="title"
          name="title"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">
          Slug (URL key)
        </label>
        <input
          id="slug"
          name="slug"
          placeholder="auto from title if empty"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
        />
        <p className="text-xs text-slate-500 mt-1">Lowercase, hyphens only. Used in /api/cms/public/[slug]</p>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
          Type
        </label>
        <select
          id="type"
          name="type"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="PAGE">Page</option>
          <option value="ANNOUNCEMENT">Announcement</option>
          <option value="BANNER_COPY">Banner copy</option>
        </select>
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1">
          Summary
        </label>
        <input
          id="summary"
          name="summary"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
          Content (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          rows={12}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="published" name="published" className="rounded border-slate-300" />
        <label htmlFor="published" className="text-sm text-slate-700">
          Published (visible on public API)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Submit label="Create document" />
        <Link
          href="/admin/cms"
          className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-medium hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
