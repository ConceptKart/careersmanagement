"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export function FeedbackFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (patch: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (!value || (key === "status" && value === "open")) {
          if (key === "status" && value === "open") params.delete(key);
          else if (!value) params.delete(key);
          else params.set(key, value);
        } else {
          params.set(key, value);
        }
      }
      if (patch.status === "open") params.delete("status");
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
          status: String(form.get("status") ?? "open"),
        });
      }}
    >
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="fb-q">
          Search
        </label>
        <input
          id="fb-q"
          name="q"
          className="form-input"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Subject, message, employee"
          disabled={pending}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="fb-status">
          Status
        </label>
        <select
          id="fb-status"
          name="status"
          className="form-input form-select"
          defaultValue={searchParams.get("status") ?? "open"}
          disabled={pending}
          onChange={(e) => update({ status: e.target.value })}
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="all">All</option>
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
