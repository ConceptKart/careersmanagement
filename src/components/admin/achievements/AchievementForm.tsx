"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AchievementFormActionState } from "@/actions/admin-achievements";
import type { ManagerOption } from "@/repositories/employees.repository";
import {
  adminAchievementFormSchema,
  type AdminAchievementFormValues,
} from "@/validators/admin-achievement.schema";

const initial: AchievementFormActionState = { ok: false };

type Props = {
  mode: "create" | "edit";
  employees: ManagerOption[];
  defaultValues: AdminAchievementFormValues;
  cancelHref: string;
  submitAction: (
    prev: AchievementFormActionState,
    formData: FormData,
  ) => Promise<AchievementFormActionState>;
};

export function AchievementForm({
  mode,
  employees,
  defaultValues,
  cancelHref,
  submitAction,
}: Props) {
  const [state, formAction, pending] = useActionState(submitAction, initial);
  const {
    register,
    formState: { errors },
    setError,
  } = useForm<AdminAchievementFormValues>({
    resolver: zodResolver(adminAchievementFormSchema) as never,
    defaultValues,
  });

  useEffect(() => {
    if (!state.fieldErrors) return;
    for (const [key, message] of Object.entries(state.fieldErrors)) {
      setError(key as keyof AdminAchievementFormValues, { message });
    }
  }, [state.fieldErrors, setError]);

  return (
    <form action={formAction} className="admin-job-form" noValidate>
      {state.message && !state.ok ? (
        <div className="alert alert-error" role="alert">
          {state.message}
        </div>
      ) : null}

      <div className="grid grid-2" style={{ gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="employeeId">
            Employee <span className="required">*</span>
          </label>
          <select
            id="employeeId"
            className={`form-input form-select${errors.employeeId ? " error" : ""}`}
            disabled={pending}
            {...register("employeeId")}
          >
            <option value="">Select employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName}
              </option>
            ))}
          </select>
          {errors.employeeId ? (
            <div className="form-error">{errors.employeeId.message}</div>
          ) : null}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="achievedOn">
            Achieved on <span className="required">*</span>
          </label>
          <input
            id="achievedOn"
            type="date"
            className={`form-input${errors.achievedOn ? " error" : ""}`}
            disabled={pending}
            {...register("achievedOn")}
          />
          {errors.achievedOn ? (
            <div className="form-error">{errors.achievedOn.message}</div>
          ) : null}
        </div>
      </div>

      <div className="form-group mt-3">
        <label className="form-label" htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          className={`form-input${errors.title ? " error" : ""}`}
          disabled={pending}
          {...register("title")}
        />
        {errors.title ? (
          <div className="form-error">{errors.title.message}</div>
        ) : null}
      </div>

      <div className="form-group mt-3">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="form-input"
          disabled={pending}
          {...register("description")}
        />
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
        </button>
        <Link href={cancelHref} className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
