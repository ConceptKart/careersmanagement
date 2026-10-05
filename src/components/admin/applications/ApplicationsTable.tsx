import Link from "next/link";
import type { ScreeningPriority } from "@prisma/client";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusSelect } from "@/components/admin/applications/StatusSelect";
import { formatDate } from "@/lib/utils/labels";
import type { AdminApplicationListItem } from "@/repositories/applications.repository";

type Props = {
  applications: AdminApplicationListItem[];
};

function ScoreCell({
  score,
  priority,
}: {
  score: number | null;
  priority: ScreeningPriority | null;
}) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-muted-foreground">Not scored</span>;
  }
  const cls =
    priority === "high"
      ? "score-high"
      : priority === "medium"
        ? "score-medium"
        : "score-low";
  return (
    <span className={`score-badge ${cls}`}>
      {score}/100
    </span>
  );
}

function PriorityCell({ priority }: { priority: ScreeningPriority | null }) {
  if (!priority) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const cls =
    priority === "high"
      ? "badge-emerald"
      : priority === "medium"
        ? "badge-amber"
        : "badge-gray";
  return <span className={`badge ${cls}`}>{priority}</span>;
}

export function ApplicationsTable({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <EmptyState
        title="No applications found"
        message="Try adjusting filters, or wait for new candidates to apply."
      />
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Applied Job</th>
            <th>Status</th>
            <th>Score</th>
            <th>Priority</th>
            <th>Applied</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>
                <Link
                  href={`/admin/applications/${app.id}`}
                  className="admin-table-primary"
                >
                  {app.name}
                </Link>
              </td>
              <td className="text-sm">{app.email ?? "—"}</td>
              <td className="text-sm">{app.phone}</td>
              <td className="text-sm">{app.jobTitle}</td>
              <td>
                <StatusSelect applicationId={app.id} status={app.status} compact />
              </td>
              <td>
                <ScoreCell score={app.screeningScore} priority={app.screeningPriority} />
              </td>
              <td>
                <PriorityCell priority={app.screeningPriority} />
              </td>
              <td className="text-sm text-muted-foreground">
                {formatDate(app.createdAt)}
              </td>
              <td>
                <Link
                  href={`/admin/applications/${app.id}`}
                  className="btn btn-outline btn-sm"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
