"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export function CompanyDocFilters() {
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
          type: String(form.get("type") ?? "all"),
          status: String(form.get("status") ?? "all"),
        });
      }}
    >
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="cd-q">
          Search
        </label>
        <input
          id="cd-q"
          name="q"
          className="form-input"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Title, description, version"
          disabled={pending}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="cd-type">
          Category
        </label>
        <select
          id="cd-type"
          name="type"
          className="form-input form-select"
          defaultValue={searchParams.get("type") ?? "all"}
          disabled={pending}
          onChange={(e) => update({ type: e.target.value })}
        >
          <option value="all">All types</option>
          <option value="org_chart">Org Chart</option>
          <option value="policy">Policy</option>
          <option value="handbook">Handbook</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="cd-status">
          Status
        </label>
        <select
          id="cd-status"
          name="status"
          className="form-input form-select"
          defaultValue={searchParams.get("status") ?? "all"}
          disabled={pending}
          onChange={(e) => update({ status: e.target.value })}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="admin-app-filters-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
          Apply
        </button>
      </div>
    </form>
  );
}
