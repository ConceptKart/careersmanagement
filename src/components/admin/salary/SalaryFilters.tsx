"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { ManagerOption } from "@/repositories/employees.repository";

type Props = { employees: ManagerOption[] };

export function SalaryFilters({ employees }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (patch: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      startTransition(() => {
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <form
      className="admin-app-filters"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        update({
          q: String(form.get("q") ?? "").trim(),
          employeeId: String(form.get("employeeId") ?? ""),
          month: String(form.get("month") ?? "").trim(),
        });
      }}
    >
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="sal-q">
          Search
        </label>
        <input
          id="sal-q"
          name="q"
          className="form-input"
          defaultValue={searchParams.get("q") ?? ""}
          disabled={pending}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="sal-emp">
          Employee
        </label>
        <select
          id="sal-emp"
          name="employeeId"
          className="form-input form-select"
          defaultValue={searchParams.get("employeeId") ?? ""}
          disabled={pending}
          onChange={(e) => update({ employeeId: e.target.value })}
        >
          <option value="">All employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.fullName}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="sal-month">
          Month
        </label>
        <input
          id="sal-month"
          name="month"
          className="form-input"
          placeholder="YYYY-MM"
          defaultValue={searchParams.get("month") ?? ""}
          disabled={pending}
        />
      </div>
      <div className="admin-app-filters-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
          Apply
        </button>
      </div>
    </form>
  );
}
