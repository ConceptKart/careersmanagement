"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  deleteEmployeeDocumentAction,
  type DocumentFormActionState,
} from "@/actions/admin-employees";
import { DeleteDialog } from "@/components/jobs/admin/DeleteDialog";
import type { AdminEmployeeDocument } from "@/repositories/employees.repository";
import {
  formatDate,
  formatINR,
  getDocumentTypeLabel,
} from "@/lib/utils/labels";

const initial: DocumentFormActionState = { ok: false };

type Props = {
  employeeId: string;
  documents: AdminEmployeeDocument[];
  uploadAction: (
    prev: DocumentFormActionState,
    formData: FormData,
  ) => Promise<DocumentFormActionState>;
};

export function EmployeeDocuments({
  employeeId,
  documents,
  uploadAction,
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(uploadAction, initial);
  const [deleting, startDelete] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <section className="card mt-6">
      <h2>Documents</h2>

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">No documents yet.</p>
      ) : (
        <div className="table-responsive mb-6">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const href = doc.filePath
                  ? `/api/admin/downloads?type=documents&file=${encodeURIComponent(doc.filePath)}`
                  : null;
                return (
                  <tr key={doc.id}>
                    <td>
                      <div className="font-medium">{doc.title}</div>
                      {doc.description ? (
                        <div className="text-sm text-muted-foreground">
                          {doc.description}
                        </div>
                      ) : null}
                    </td>
                    <td>{getDocumentTypeLabel(doc.documentType)}</td>
                    <td>{doc.period ?? "—"}</td>
                    <td>{formatINR(doc.amount)}</td>
                    <td>{formatDate(doc.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        {href ? (
                          <a
                            href={href}
                            className="btn btn-outline btn-sm"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          "—"
                        )}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          disabled={deleting}
                          onClick={() => setDeleteId(doc.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <DeleteDialog
        open={deleteId !== null}
        title="Delete document"
        message="Remove this employee document record?"
        confirmLabel="Delete"
        destructive
        pending={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          startDelete(async () => {
            await deleteEmployeeDocumentAction(deleteId);
            setDeleteId(null);
            router.refresh();
          });
        }}
      />

      <h3 className="text-base font-semibold mb-3">Add document</h3>
      {state.message ? (
        <div
          className={`alert ${state.ok ? "alert-success" : "alert-error"} mb-3`}
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <form
        ref={formRef}
        action={formAction}
        className="admin-job-form"
        noValidate
      >
        <input type="hidden" name="employeeId" value={employeeId} />
        <div className="grid grid-2" style={{ gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="doc-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="doc-title"
              name="title"
              className="form-input"
              required
              disabled={pending}
            />
            {state.fieldErrors?.title ? (
              <div className="form-error">{state.fieldErrors.title}</div>
            ) : null}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="doc-type">
              Type
            </label>
            <select
              id="doc-type"
              name="documentType"
              className="form-input form-select"
              defaultValue="other"
              disabled={pending}
            >
              <option value="offer_letter">Offer Letter</option>
              <option value="salary_slip">Salary Slip</option>
              <option value="increment_letter">Increment Letter</option>
              <option value="employment_history">Employment History</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="doc-period">
              Period
            </label>
            <input
              id="doc-period"
              name="period"
              className="form-input"
              placeholder="e.g. 2026-01"
              disabled={pending}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="doc-amount">
              Amount
            </label>
            <input
              id="doc-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              disabled={pending}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="doc-effective">
              Effective date
            </label>
            <input
              id="doc-effective"
              name="effectiveDate"
              type="date"
              className="form-input"
              disabled={pending}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="doc-file">
              File
            </label>
            <input
              id="doc-file"
              name="file"
              type="file"
              className="form-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              disabled={pending}
            />
            {state.fieldErrors?.file ? (
              <div className="form-error">{state.fieldErrors.file}</div>
            ) : null}
          </div>
        </div>
        <div className="form-group mt-3">
          <label className="form-label" htmlFor="doc-description">
            Description
          </label>
          <textarea
            id="doc-description"
            name="description"
            rows={3}
            className="form-input"
            disabled={pending}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-sm mt-3"
          disabled={pending}
        >
          {pending ? "Uploading…" : "Add document"}
        </button>
      </form>
    </section>
  );
}
