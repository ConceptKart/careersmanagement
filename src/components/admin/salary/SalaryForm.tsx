"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SalaryFormActionState } from "@/actions/admin-salary";
import type { ManagerOption } from "@/repositories/employees.repository";
import {
  adminSalaryFormSchema,
  type AdminSalaryFormValues,
} from "@/validators/admin-salary.schema";

const initial: SalaryFormActionState = { ok: false };

type Props = {
  mode: "create" | "edit";
  employees: ManagerOption[];
  defaultValues: AdminSalaryFormValues;
  cancelHref: string;
  submitAction: (
    prev: SalaryFormActionState,
    formData: FormData,
  ) => Promise<SalaryFormActionState>;
};

export function SalaryForm({
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
  } = useForm<AdminSalaryFormValues>({
    resolver: zodResolver(adminSalaryFormSchema) as never,
    defaultValues,
  });

  useEffect(() => {
    if (!state.fieldErrors) return;
    for (const [key, message] of Object.entries(state.fieldErrors)) {
      setError(key as keyof AdminSalaryFormValues, { message });
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
          {mode === "edit" ? (
            <>
              <input type="hidden" {...register("employeeId")} />
              <input
                id="employeeId"
                className="form-input"
                value={
                  employees.find((e) => e.id === defaultValues.employeeId)
                    ?.fullName ?? defaultValues.employeeId
                }
                disabled
                readOnly
              />
            </>
          ) : (
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
          )}
          {errors.employeeId ? (
            <div className="form-error">{errors.employeeId.message}</div>
          ) : null}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="month">
            Month (YYYY-MM) <span className="required">*</span>
          </label>
          <input
            id="month"
            className={`form-input${errors.month ? " error" : ""}`}
            placeholder="2026-01"
            disabled={pending}
            {...register("month")}
          />
          {errors.month ? (
            <div className="form-error">{errors.month.message}</div>
          ) : null}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="basicSalary">
            Basic salary <span className="required">*</span>
          </label>
          <input
            id="basicSalary"
            type="number"
            step="0.01"
            min="0"
            className={`form-input${errors.basicSalary ? " error" : ""}`}
            disabled={pending}
            {...register("basicSalary")}
          />
          {errors.basicSalary ? (
            <div className="form-error">{errors.basicSalary.message}</div>
          ) : null}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="hra">
            HRA
          </label>
          <input
            id="hra"
            type="number"
            step="0.01"
            min="0"
            className="form-input"
            disabled={pending}
            {...register("hra")}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="allowances">
            Allowances
          </label>
          <input
            id="allowances"
            type="number"
            step="0.01"
            min="0"
            className="form-input"
            disabled={pending}
            {...register("allowances")}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="deductions">
            Deductions
          </label>
          <input
            id="deductions"
            type="number"
            step="0.01"
            min="0"
            className="form-input"
            disabled={pending}
            {...register("deductions")}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="netSalary">
            Net salary <span className="required">*</span>
          </label>
          <input
            id="netSalary"
            type="number"
            step="0.01"
            min="0"
            className={`form-input${errors.netSalary ? " error" : ""}`}
            disabled={pending}
            {...register("netSalary")}
          />
          {errors.netSalary ? (
            <div className="form-error">{errors.netSalary.message}</div>
          ) : null}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="paidOn">
            Paid on
          </label>
          <input
            id="paidOn"
            type="date"
            className="form-input"
            disabled={pending}
            {...register("paidOn")}
          />
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create record" : "Save changes"}
        </button>
        <Link href={cancelHref} className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
