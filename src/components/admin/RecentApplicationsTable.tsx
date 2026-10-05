import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/applications/StatusBadge";
import { formatDate } from "@/lib/utils/labels";
import type { RecentApplicationRow } from "@/repositories/dashboard.repository";
import type { ApplicationStatus } from "@prisma/client";

type Props = {
  applications: RecentApplicationRow[];
};

export function RecentApplicationsTable({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <EmptyState
        title="No applications yet"
        message="New applications will appear here as candidates apply."
      />
    );
  }

  return (
    <div className="admin-recent-list">
      <ul className="admin-recent-items">
        {applications.map((app) => (
          <li key={app.id} className="admin-recent-item">
            <div className="admin-recent-item-main">
              <Link
                href={`/admin/applications/${app.id}`}
                className="admin-recent-item-title"
              >
                {app.name}
              </Link>
              <p className="admin-recent-item-meta">
                <span className="admin-recent-item-ellipsis">{app.jobTitle}</span>
                <span className="admin-recent-dot" aria-hidden>
                  ·
                </span>
                <span>{app.jobDepartment}</span>
              </p>
            </div>
            <div className="admin-recent-item-side">
              <StatusBadge status={app.status as ApplicationStatus} />
              <time className="admin-recent-item-date" dateTime={app.createdAt.toISOString()}>
                {formatDate(app.createdAt)}
              </time>
              <Link
                href={`/admin/applications/${app.id}`}
                className="btn btn-outline btn-sm"
              >
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <div className="admin-recent-footer">
        <Link href="/admin/applications">View all applications →</Link>
      </div>
    </div>
  );
}
