"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCompanyDocumentAction,
  type CompanyDocActionState,
} from "@/actions/admin-company-documents";

const initial: CompanyDocActionState = { ok: false };

export function CompanyDocumentUpload() {
  const [state, formAction, pending] = useActionState(
    createCompanyDocumentAction,
    initial,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <section className="card mt-6">
      <h2>Upload company document</h2>
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
        <div className="grid grid-2" style={{ gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="cd-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="cd-title"
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
            <label className="form-label" htmlFor="cd-doctype">
              Category
            </label>
            <select
              id="cd-doctype"
              name="documentType"
              className="form-input form-select"
              defaultValue="policy"
              disabled={pending}
            >
              <option value="org_chart">Org Chart</option>
              <option value="policy">Policy</option>
              <option value="handbook">Handbook</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cd-version">
              Version
            </label>
            <input
              id="cd-version"
              name="version"
              className="form-input"
              disabled={pending}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cd-effective">
              Effective date
            </label>
            <input
              id="cd-effective"
              name="effectiveDate"
              type="date"
              className="form-input"
              disabled={pending}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cd-file">
              File
            </label>
            <input
              id="cd-file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              className="form-input"
              disabled={pending}
            />
            {state.fieldErrors?.file ? (
              <div className="form-error">{state.fieldErrors.file}</div>
            ) : null}
          </div>
        </div>
        <div className="form-group mt-3">
          <label className="form-label" htmlFor="cd-desc">
            Description
          </label>
          <textarea
            id="cd-desc"
            name="description"
            rows={3}
            className="form-input"
            disabled={pending}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm mt-3" disabled={pending}>
          {pending ? "Uploading…" : "Upload document"}
        </button>
      </form>
    </section>
  );
}
