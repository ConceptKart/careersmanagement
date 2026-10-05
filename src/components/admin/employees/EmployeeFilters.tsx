"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

type Props = {
  departments: string[];
};

export function EmployeeFilters({ departments }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (patch: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (!value || value === "all") params.delete(key);
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
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        update({
          q: String(form.get("q") ?? "").trim(),
          department: String(form.get("department") ?? ""),
          status: String(form.get("status") ?? "all"),
          sort: String(form.get("sort") ?? "recent"),
        });
      }}
    >
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="emp-q">
          Search
        </label>
        <input
          id="emp-q"
          name="q"
          className="form-input"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Name, email, department, or role"
          disabled={pending}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="emp-department">
          Department
        </label>
        <select
          id="emp-department"
          name="department"
          className="form-input form-select"
          defaultValue={searchParams.get("department") ?? ""}
          disabled={pending}
          onChange={(event) => update({ department: event.target.value })}
        >
          <option value="">All departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="emp-status">
          Status
        </label>
        <select
          id="emp-status"
          name="status"
          className="form-input form-select"
          defaultValue={searchParams.get("status") ?? "all"}
          disabled={pending}
          onChange={(event) => update({ status: event.target.value })}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
          <option value="terminated">Terminated</option>
          <option value="resigned">Resigned</option>
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="emp-sort">
          Sort
        </label>
        <select
          id="emp-sort"
          name="sort"
          className="form-input form-select"
          defaultValue={searchParams.get("sort") ?? "recent"}
          disabled={pending}
          onChange={(event) => update({ sort: event.target.value })}
        >
          <option value="recent">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="department">Department</option>
          <option value="joining">Joining date</option>
        </select>
      </div>

      <div className="admin-app-filters-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
          {pending ? "Applying…" : "Apply"}
        </button>
      </div>
    </form>
  );
}
