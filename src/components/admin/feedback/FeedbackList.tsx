"use client";

import { useActionState } from "react";
import {
  respondToFeedbackAction,
  type FeedbackRespondState,
} from "@/actions/admin-feedback";
import type { AdminFeedbackListItem } from "@/repositories/feedback.repository";
import { formatDateTime } from "@/lib/utils/labels";

const initial: FeedbackRespondState = { ok: false };

function FeedbackCard({ item }: { item: AdminFeedbackListItem }) {
  const respondAction = respondToFeedbackAction.bind(null, item.id);
  const [state, formAction, pending] = useActionState(respondAction, initial);

  return (
    <article className="card mb-4">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="font-semibold">{item.subject}</h3>
          <p className="text-sm text-muted-foreground">
            {item.employeeName}
            {item.category ? ` · ${item.category}` : ""} ·{" "}
            {formatDateTime(item.createdAt)}
          </p>
        </div>
        <span
          className={item.isResolved ? "badge badge-emerald" : "badge badge-amber"}
        >
          {item.isResolved ? "Resolved" : "Open"}
        </span>
      </div>
      <p className="mb-3 whitespace-pre-wrap">{item.message}</p>

      {item.hrResponse ? (
        <div className="mb-3 p-3 rounded" style={{ background: "var(--muted)" }}>
          <div className="text-sm font-medium mb-1">HR response</div>
          <p className="text-sm whitespace-pre-wrap">{item.hrResponse}</p>
        </div>
      ) : null}

      {!item.isResolved ? (
        <form action={formAction} className="admin-job-form">
          {state.message ? (
            <div
              className={`alert ${state.ok ? "alert-success" : "alert-error"} mb-2`}
            >
              {state.message}
            </div>
          ) : null}
          <div className="form-group">
            <label className="form-label" htmlFor={`resp-${item.id}`}>
              Response
            </label>
            <textarea
              id={`resp-${item.id}`}
              name="hrResponse"
              rows={3}
              className="form-input"
              disabled={pending}
              placeholder="Reply to the employee…"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
            {pending ? "Saving…" : "Respond & resolve"}
          </button>
        </form>
      ) : null}
    </article>
  );
}

type Props = { items: AdminFeedbackListItem[] };

export function FeedbackList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="admin-empty-state">
        <p>No feedback items match these filters.</p>
      </div>
    );
  }
  return (
    <div>
      {items.map((item) => (
        <FeedbackCard key={item.id} item={item} />
      ))}
    </div>
  );
}
