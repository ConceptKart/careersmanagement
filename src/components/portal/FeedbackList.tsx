"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  submitPortalFeedbackAction,
  type PortalFeedbackActionState,
} from "@/actions/portal-feedback";
import type { PortalFeedbackItem } from "@/repositories/portal.repository";
import { formatDateTime } from "@/lib/utils/labels";

const initial: PortalFeedbackActionState = { ok: false };

type Props = {
  items: PortalFeedbackItem[];
};

export function FeedbackList({ items }: Props) {
  const [state, formAction, pending] = useActionState(
    submitPortalFeedbackAction,
    initial,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-6">
      <section className="card">
        <h2>Submit feedback</h2>
        {state.message ? (
          <div
            className={`alert ${state.ok ? "alert-success" : "alert-error"} mb-3`}
            role="status"
          >
            {state.message}
          </div>
        ) : null}
        <form ref={formRef} action={formAction} className="admin-job-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="fb-category">
              Category
            </label>
            <select
              id="fb-category"
              name="category"
              className="form-input form-select"
              disabled={pending}
              defaultValue=""
            >
              <option value="">Select category</option>
              <option value="Work Environment">Work Environment</option>
              <option value="Management">Management</option>
              <option value="Growth">Growth</option>
              <option value="Benefits">Benefits</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="fb-subject">
              Subject <span className="required">*</span>
            </label>
            <input
              id="fb-subject"
              name="subject"
              className="form-input"
              required
              disabled={pending}
            />
            {state.fieldErrors?.subject ? (
              <div className="form-error">{state.fieldErrors.subject}</div>
            ) : null}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="fb-message">
              Message <span className="required">*</span>
            </label>
            <textarea
              id="fb-message"
              name="message"
              rows={5}
              className="form-input"
              required
              disabled={pending}
            />
            {state.fieldErrors?.message ? (
              <div className="form-error">{state.fieldErrors.message}</div>
            ) : null}
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Submitting…" : "Submit feedback"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3">Your feedback</h2>
        {items.length === 0 ? (
          <div className="card">
            <p className="text-sm text-muted-foreground">No feedback submitted yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <article key={item.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold">{item.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.category ? `${item.category} · ` : ""}
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                  <span
                    className={
                      item.isResolved ? "badge badge-emerald" : "badge badge-amber"
                    }
                  >
                    {item.isResolved ? "Resolved" : "Pending"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{item.message}</p>
                {item.hrResponse ? (
                  <div
                    className="mt-3 p-3 rounded"
                    style={{ background: "var(--muted)" }}
                  >
                    <div className="text-sm font-medium mb-1">HR response</div>
                    <p className="text-sm whitespace-pre-wrap">{item.hrResponse}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
