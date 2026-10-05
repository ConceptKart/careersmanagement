"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { JobFormActionState } from "@/actions/admin-jobs";
import {
  adminJobFormSchema,
  type AdminJobFormValues,
} from "@/validators/admin-job.schema";

const initial: JobFormActionState = { ok: false };

type Props = {
  mode: "create" | "edit";
  defaultValues: AdminJobFormValues;
  cancelHref: string;
  submitAction: (
    prev: JobFormActionState,
    formData: FormData,
  ) => Promise<JobFormActionState>;
};

export function JobForm({ mode, defaultValues, cancelHref, submitAction }: Props) {
  const [state, formAction, pending] = useActionState(submitAction, initial);

  const {
    register,
    formState: { errors },
    setError,
    watch,
  } = useForm<AdminJobFormValues>({
    resolver: zodResolver(adminJobFormSchema) as never,
    defaultValues,
  });

  useEffect(() => {
    if (!state.fieldErrors) return;
    for (const [key, message] of Object.entries(state.fieldErrors)) {
      setError(key as keyof AdminJobFormValues, { message });
    }
  }, [state.fieldErrors, setError]);

  const isActive = watch("isActive");

  return (
    <form action={formAction} className="admin-job-form" noValidate>
      {state.message && !state.ok ? (
        <div className="alert alert-error" role="alert">
          {state.message}
        </div>
      ) : null}

      <section className="admin-form-section">
        <h2>Basic information</h2>
        <div className="grid grid-2" style={{ gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Job title <span className="required">*</span>
            </label>
            <input
              id="title"
              className={`form-input${errors.title ? " error" : ""}`}
              disabled={pending}
              {...register("title")}
            />
            {errors.title ? <div className="form-error">{errors.title.message}</div> : null}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="department">
              Department <span className="required">*</span>
            </label>
            <input
              id="department"
              className={`form-input${errors.department ? " error" : ""}`}
              disabled={pending}
              {...register("department")}
            />
            {errors.department ? (
              <div className="form-error">{errors.department.message}</div>
            ) : null}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="location">
              Location <span className="required">*</span>
            </label>
            <input
              id="location"
              className={`form-input${errors.location ? " error" : ""}`}
              placeholder="e.g. Mumbai, India (Hybrid)"
              disabled={pending}
              {...register("location")}
            />
            {errors.location ? (
              <div className="form-error">{errors.location.message}</div>
            ) : null}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="jobType">
              Employment type
            </label>
            <select
              id="jobType"
              className="form-input form-select"
              disabled={pending}
              {...register("jobType")}
            >
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2>Description</h2>
        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Job description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            className={`form-input form-textarea${errors.description ? " error" : ""}`}
            rows={6}
            disabled={pending}
            {...register("description")}
          />
          {errors.description ? (
            <div className="form-error">{errors.description.message}</div>
          ) : null}
        </div>
      </section>

      <section className="admin-form-section">
        <h2>Requirements</h2>
        <div className="form-group">
          <label className="form-label" htmlFor="requirements">
            Requirements <span className="required">*</span>
          </label>
          <textarea
            id="requirements"
            className={`form-input form-textarea${errors.requirements ? " error" : ""}`}
            rows={5}
            disabled={pending}
            {...register("requirements")}
          />
          {errors.requirements ? (
            <div className="form-error">{errors.requirements.message}</div>
          ) : null}
        </div>
      </section>

      <section className="admin-form-section">
        <h2>Responsibilities</h2>
        <div className="form-group">
          <label className="form-label" htmlFor="keyResponsibilities">
            Key responsibilities
          </label>
          <textarea
            id="keyResponsibilities"
            className="form-input form-textarea"
            rows={4}
            placeholder="List the key responsibilities for this role"
            disabled={pending}
            {...register("keyResponsibilities")}
          />
        </div>
      </section>

      <section className="admin-form-section">
        <h2>Compensation</h2>
        <div className="form-group">
          <label className="form-label" htmlFor="salaryOffered">
            Salary offered
          </label>
          <input
            id="salaryOffered"
            className="form-input"
            placeholder="e.g. ₹8,00,000 - ₹12,00,000 per annum"
            disabled={pending}
            {...register("salaryOffered")}
          />
        </div>
      </section>

      <section className="admin-form-section">
        <h2>Screening & discovery</h2>
        <p className="admin-form-hint text-muted-foreground">
          Benefits, experience band, and dedicated SEO fields are not in the current
          database schema. Screening keywords support resume matching and search
          relevance.
        </p>
        <div className="form-group">
          <label className="form-label" htmlFor="screeningKeywords">
            Screening keywords
          </label>
          <input
            id="screeningKeywords"
            className="form-input"
            placeholder="React, TypeScript, CSS (comma separated)"
            disabled={pending}
            {...register("screeningKeywords")}
          />
          <div className="form-hint">Comma-separated keywords for AI resume screening.</div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2>Status</h2>
        <label className="admin-checkbox-row">
          <input type="checkbox" disabled={pending} {...register("isActive")} />
          <span>
            {isActive ? "Published (active / visible to candidates)" : "Draft (inactive)"}
          </span>
        </label>
      </section>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create job"
              : "Save changes"}
        </button>
        <Link href={cancelHref} className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
