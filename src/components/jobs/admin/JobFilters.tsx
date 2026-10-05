"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

type Props = {
  departments: string[];
  locations: string[];
};

export function JobFilters({ departments, locations }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const dept = searchParams.get("dept") ?? "";
  const loc = searchParams.get("loc") ?? "";
  const status = searchParams.get("status") ?? "all";

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
      className="admin-job-filters"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        update({
          q: String(form.get("q") ?? "").trim(),
          dept: String(form.get("dept") ?? ""),
          loc: String(form.get("loc") ?? ""),
          status: String(form.get("status") ?? "all"),
        });
      }}
    >
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="job-q">
          Search
        </label>
        <input
          id="job-q"
          name="q"
          className="form-input"
          defaultValue={q}
          placeholder="Search by title"
          disabled={pending}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="job-dept">
          Department
        </label>
        <select
          id="job-dept"
          name="dept"
          className="form-input form-select"
          defaultValue={dept}
          disabled={pending}
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="job-loc">
          Location
        </label>
        <select
          id="job-loc"
          name="loc"
          className="form-input form-select"
          defaultValue={loc}
          disabled={pending}
        >
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="job-status">
          Status
        </label>
        <select
          id="job-status"
          name="status"
          className="form-input form-select"
          defaultValue={status}
          disabled={pending}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="admin-job-filters-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Filtering…" : "Apply"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={pending}
          onClick={() => {
            startTransition(() => router.push(pathname));
          }}
        >
          Reset
        </button>
      </div>
    </form>
  );
}
