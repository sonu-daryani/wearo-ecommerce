"use client";

import type { CmsDocument } from "@prisma/client";
import { useFormState, useFormStatus } from "react-dom";
import { updateCmsDocument, type FormState } from "../../actions";
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

export function CmsEditForm({ doc }: { doc: CmsDocument }) {
  const [state, action] = useFormState(updateCmsDocument, initial);

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <input type="hidden" name="id" value={doc.id} />

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
          defaultValue={doc.title}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={doc.slug}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
          Type
        </label>
        <select
          id="type"
          name="type"
          defaultValue={doc.type}
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
          defaultValue={doc.summary ?? ""}
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
          defaultValue={doc.content}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          name="published"
          defaultChecked={doc.published}
          className="rounded border-slate-300"
        />
        <label htmlFor="published" className="text-sm text-slate-700">
          Published
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Submit label="Save changes" />
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
