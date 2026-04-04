"use client";

import { useFormState, useFormStatus } from "react-dom";
import { deleteCmsDocument, type FormState } from "./actions";
import { useState } from "react";

const initial: FormState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-red-600 font-medium hover:underline disabled:opacity-50 text-sm"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}

export function DeleteCmsButton({ id }: { id: string }) {
  const [state, action] = useFormState(deleteCmsDocument, initial);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-red-600 font-medium hover:underline text-sm"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-500 text-sm hover:underline"
        >
          Cancel
        </button>
        <Submit />
      </form>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </span>
  );
}
