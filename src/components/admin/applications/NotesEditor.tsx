"use client";

import { useActionState, useEffect, useRef } from "react";
import type { MutationResult } from "@/actions/admin-applications";
import { updateAdminNotesAction } from "@/actions/admin-applications";

const initial: MutationResult = { ok: false };

type Props = {
  applicationId: string;
  initialNotes: string;
  updateNotesAction?: (
    prev: MutationResult,
    formData: FormData,
  ) => Promise<MutationResult>;
};

export function NotesEditor({
  applicationId,
  initialNotes,
  updateNotesAction = updateAdminNotesAction,
}: Props) {
  const [state, formAction, pending] = useActionState(updateNotesAction, initial);
  const savedRef = useRef(false);

  useEffect(() => {
    if (state.ok) savedRef.current = true;
  }, [state.ok]);

  return (
    <section className="card notes-section">
      <div className="notes-label">
        Admin notes
        <span className="private">private</span>
      </div>
      <form action={formAction}>
        <input type="hidden" name="applicationId" value={applicationId} />
        <textarea
          name="adminNotes"
          className="form-input"
          rows={4}
          defaultValue={initialNotes}
          placeholder="Interview impressions, follow-ups, references..."
          disabled={pending}
        />
        <div className="flex items-center gap-3 mt-2">
          <button type="submit" className="btn btn-sm btn-secondary" disabled={pending}>
            {pending ? "Saving…" : "Save notes"}
          </button>
          {state.ok ? (
            <span className="text-sm text-muted-foreground">{state.message}</span>
          ) : null}
          {state.message && !state.ok ? (
            <span className="form-error">{state.message}</span>
          ) : null}
        </div>
      </form>
    </section>
  );
}
