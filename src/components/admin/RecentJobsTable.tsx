import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatDate } from "@/lib/utils/labels";
import type { RecentJobRow } from "@/repositories/dashboard.repository";

type Props = {
  jobs: RecentJobRow[];
};

export function RecentJobsTable({ jobs }: Props) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs yet"
        message="Create a job posting to start receiving applications."
      />
    );
  }

  return (
    <div className="admin-recent-list">
      <ul className="admin-recent-items">
        {jobs.map((job) => (
          <li key={job.id} className="admin-recent-item">
            <div className="admin-recent-item-main">
              <Link href={`/admin/jobs/${job.id}`} className="admin-recent-item-title">
                {job.title}
              </Link>
              <p className="admin-recent-item-meta">
                <span>{job.department}</span>
                <span className="admin-recent-dot" aria-hidden>
                  ·
                </span>
                <span className="admin-recent-item-ellipsis">{job.location}</span>
              </p>
            </div>
            <div className="admin-recent-item-side">
              <span className={`badge ${job.isActive ? "badge-emerald" : "badge-gray"}`}>
                {job.isActive ? "Active" : "Inactive"}
              </span>
              <time className="admin-recent-item-date" dateTime={job.createdAt.toISOString()}>
                {formatDate(job.createdAt)}
              </time>
              <Link href={`/admin/jobs/${job.id}`} className="btn btn-outline btn-sm">
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <div className="admin-recent-footer">
        <Link href="/admin/jobs">View all jobs →</Link>
      </div>
    </div>
  );
}
