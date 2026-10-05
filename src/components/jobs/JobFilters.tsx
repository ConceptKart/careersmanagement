"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Props = {
  departments: string[];
  locations: string[];
  initialQ: string;
  initialDept: string;
  initialLoc: string;
};

/**
 * PHP reference (jobs.php filters): search + department + location + Clear.
 * Client component only for URL-driven filter UX (no data fetching).
 */
export function JobFilters({
  departments,
  locations,
  initialQ,
  initialDept,
  initialLoc,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function pushFilters(next: { q?: string; dept?: string; loc?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const q = next.q ?? initialQ;
    const dept = next.dept ?? initialDept;
    const loc = next.loc ?? initialLoc;

    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    if (dept) params.set("dept", dept);
    else params.delete("dept");
    if (loc) params.set("loc", loc);
    else params.delete("loc");

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/jobs?${qs}` : "/jobs");
    });
  }

  return (
    <form
      className="jobs-filter-form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        pushFilters({
          q: String(fd.get("q") ?? ""),
          dept: String(fd.get("dept") ?? ""),
          loc: String(fd.get("loc") ?? ""),
        });
      }}
    >
      <div className="filter-row">
        <div className="filter-search">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            name="q"
            className="form-input"
            placeholder="Search by job title..."
            defaultValue={initialQ}
            aria-label="Search by job title"
          />
        </div>

        <div className="filter-dept">
          <select
            name="dept"
            className="form-input form-select"
            defaultValue={initialDept}
            disabled={pending}
            aria-label="Department"
            onChange={(e) => {
              const form = e.currentTarget.form;
              if (!form) return;
              const fd = new FormData(form);
              pushFilters({
                q: String(fd.get("q") ?? ""),
                dept: e.target.value,
                loc: String(fd.get("loc") ?? ""),
              });
            }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-loc">
          <select
            name="loc"
            className="form-input form-select"
            defaultValue={initialLoc}
            disabled={pending}
            aria-label="Location"
            onChange={(e) => {
              const form = e.currentTarget.form;
              if (!form) return;
              const fd = new FormData(form);
              pushFilters({
                q: String(fd.get("q") ?? ""),
                dept: String(fd.get("dept") ?? ""),
                loc: e.target.value,
              });
            }}
          >
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-clear">
          <Link href="/jobs" className="btn btn-ghost btn-sm">
            Clear Filters
          </Link>
        </div>
      </div>
    </form>
  );
}
