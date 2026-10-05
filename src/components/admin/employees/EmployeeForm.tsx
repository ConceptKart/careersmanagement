"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EmployeeFormActionState } from "@/actions/admin-employees";
import type { ManagerOption } from "@/repositories/employees.repository";
import {
  adminEmployeeCreateSchema,
  adminEmployeeUpdateSchema,
  type AdminEmployeeCreateValues,
  type AdminEmployeeUpdateValues,
} from "@/validators/admin-employee.schema";

const initial: EmployeeFormActionState = { ok: false };

type CreateProps = {
  mode: "create";
  defaultValues: AdminEmployeeCreateValues;
  managers: ManagerOption[];
  cancelHref: string;
  submitAction: (
    prev: EmployeeFormActionState,
    formData: FormData,
  ) => Promise<EmployeeFormActionState>;
};

type EditProps = {
  mode: "edit";
  email: string;
  defaultValues: AdminEmployeeUpdateValues;
  managers: ManagerOption[];
  cancelHref: string;
  submitAction: (
    prev: EmployeeFormActionState,
    formData: FormData,
  ) => Promise<EmployeeFormActionState>;
};

type Props = CreateProps | EditProps;

export function EmployeeForm(props: Props) {
  const { mode, defaultValues, managers, cancelHref, submitAction } = props;
  const [state, formAction, pending] = useActionState(submitAction, initial);

  const schema =
    mode === "create" ? adminEmployeeCreateSchema : adminEmployeeUpdateSchema;

  const {
    register,
    formState: { errors },
    setError,
  } = useForm<AdminEmployeeCreateValues | AdminEmployeeUpdateValues>({
    resolver: zodResolver(schema) as never,
    defaultValues,
  });

  useEffect(() => {
    if (!state.fieldErrors) return;
    for (const [key, message] of Object.entries(state.fieldErrors)) {
      if (key === "file") continue;
      setError(key as keyof AdminEmployeeCreateValues, { message });
    }
  }, [state.fieldErrors, setError]);

  return (
    <form action={formAction} className="admin-job-form" noValidate>
      {state.message && !state.ok ? (
        <div className="alert alert-error" role="alert">
          {state.message}
        </div>
      ) : null}

      <section className="admin-form-section">
        <h2>Personal information</h2>
        <div className="grid grid-2" style={{ gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full name <span className="required">*</span>
            </label>
            <input
              id="fullName"
              className={`form-input${errors.fullName ? " error" : ""}`}
              disabled={pending}
              {...register("fullName")}
            />
            {errors.fullName ? (
              <div className="form-error">{errors.fullName.message}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email <span className="required">*</span>
            </label>
            {mode === "create" ? (
              <input
                id="email"
                type="email"
                className={`form-input${"email" in errors && errors.email ? " error" : ""}`}
                disabled={pending}
                {...register("email")}
              />
            ) : (
              <input
                id="email"
                type="email"
                className="form-input"
                value={props.email}
                disabled
                readOnly
              />
            )}
            {mode === "create" && "email" in errors && errors.email ? (
              <div className="form-error">{errors.email.message}</div>
            ) : null}
            {mode === "edit" ? (
              <p className="text-sm text-muted-foreground mt-1">
                Email cannot be changed after creation.
              </p>
            ) : null}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              className={`form-input${errors.phone ? " error" : ""}`}
              disabled={pending}
              {...register("phone")}
            />
            {errors.phone ? (
              <div className="form-error">{errors.phone.message}</div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2>Employment information</h2>
        <div className="grid grid-2" style={{ gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="position">
              Designation <span className="required">*</span>
            </label>
            <input
              id="position"
              className={`form-input${errors.position ? " error" : ""}`}
              disabled={pending}
              {...register("position")}
            />
            {errors.position ? (
              <div className="form-error">{errors.position.message}</div>
            ) : null}
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
            <label className="form-label" htmlFor="employmentType">
              Employment type
            </label>
            <select
              id="employmentType"
              className="form-input form-select"
              disabled={pending}
              {...register("employmentType")}
            >
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="form-input form-select"
              disabled={pending}
              {...register("status")}
            >
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
              <option value="resigned">Resigned</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dateOfJoining">
              Joining date <span className="required">*</span>
            </label>
            <input
              id="dateOfJoining"
              type="date"
              className={`form-input${errors.dateOfJoining ? " error" : ""}`}
              disabled={pending}
              {...register("dateOfJoining")}
            />
            {errors.dateOfJoining ? (
              <div className="form-error">{errors.dateOfJoining.message}</div>
            ) : null}
          </div>

          {mode === "edit" ? (
            <div className="form-group">
              <label className="form-label" htmlFor="dateOfExit">
                Exit date
              </label>
              <input
                id="dateOfExit"
                type="date"
                className="form-input"
                disabled={pending}
                {...register("dateOfExit")}
              />
            </div>
          ) : null}

          <div className="form-group">
            <label className="form-label" htmlFor="salary">
              Current salary (INR)
            </label>
            <input
              id="salary"
              type="number"
              step="0.01"
              min="0"
              className={`form-input${errors.salary ? " error" : ""}`}
              disabled={pending}
              {...register("salary")}
            />
            {errors.salary ? (
              <div className="form-error">{errors.salary.message}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="managerId">
              Manager
            </label>
            <select
              id="managerId"
              className="form-input form-select"
              disabled={pending}
              {...register("managerId")}
            >
              <option value="">No manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="form-label" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            className="form-input"
            disabled={pending}
            {...register("notes")}
          />
        </div>
      </section>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create employee"
              : "Save changes"}
        </button>
        <Link href={cancelHref} className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
