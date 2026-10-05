"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

type JobOption = { id: string; title: string };

type Props = {
  jobs: JobOption[];
};

export function ApplicationFilters({ jobs }: Props) {
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
          job: String(form.get("job") ?? ""),
          status: String(form.get("status") ?? "all"),
          priority: String(form.get("priority") ?? "all"),
          dateFrom: String(form.get("dateFrom") ?? ""),
          dateTo: String(form.get("dateTo") ?? ""),
          sort: String(form.get("sort") ?? "recent"),
        });
      }}
    >
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="app-q">
          Search
        </label>
        <input
          id="app-q"
          name="q"
          className="form-input"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Name, email, or phone"
          disabled={pending}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="app-job">
          Job
        </label>
        <select
          id="app-job"
          name="job"
          className="form-input form-select"
          defaultValue={searchParams.get("job") ?? ""}
          disabled={pending}
        >
          <option value="">All jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="app-status">
          Status
        </label>
        <select
          id="app-status"
          name="status"
          className="form-input form-select"
          defaultValue={searchParams.get("status") ?? "all"}
          disabled={pending}
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="in_review">In Review</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview_scheduled">Interview Scheduled</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="app-priority">
          Priority
        </label>
        <select
          id="app-priority"
          name="priority"
          className="form-input form-select"
          defaultValue={searchParams.get("priority") ?? "all"}
          disabled={pending}
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="app-from">
          From
        </label>
        <input
          id="app-from"
          name="dateFrom"
          type="date"
          className="form-input"
          defaultValue={searchParams.get("dateFrom") ?? ""}
          disabled={pending}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="app-to">
          To
        </label>
        <input
          id="app-to"
          name="dateTo"
          type="date"
          className="form-input"
          defaultValue={searchParams.get("dateTo") ?? ""}
          disabled={pending}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="app-sort">
          Sort
        </label>
        <select
          id="app-sort"
          name="sort"
          className="form-input form-select"
          defaultValue={searchParams.get("sort") ?? "recent"}
          disabled={pending}
        >
          <option value="recent">Most recent</option>
          <option value="score">Highest score</option>
        </select>
      </div>
      <div className="admin-app-filters-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Filtering…" : "Apply"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={pending}
          onClick={() => startTransition(() => router.push(pathname))}
        >
          Reset
        </button>
      </div>
    </form>
  );
}
