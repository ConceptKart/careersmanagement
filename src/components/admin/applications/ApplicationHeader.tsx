import Link from "next/link";
import { StatusBadge } from "@/components/admin/applications/StatusBadge";
import { StatusSelect } from "@/components/admin/applications/StatusSelect";
import { formatDateTime } from "@/lib/utils/labels";
import type { AdminApplicationDetail } from "@/repositories/applications.repository";

type Props = {
  application: AdminApplicationDetail;
};

export function ApplicationHeader({ application }: Props) {
  return (
    <div className="admin-app-header">
      <div>
        <div className="admin-app-header-badges">
          <StatusBadge status={application.status} />
          {application.screeningScore !== null ? (
            <span
              className={`score-badge ${
                application.screeningPriority === "high"
                  ? "score-high"
                  : application.screeningPriority === "medium"
                    ? "score-medium"
                    : "score-low"
              }`}
            >
              {application.screeningScore}/100
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Applied for{" "}
          <Link href={`/admin/jobs/${application.job.id}`} className="text-primary">
            {application.job.title}
          </Link>{" "}
          on {formatDateTime(application.createdAt)}
        </p>
      </div>
      <div className="admin-app-header-status">
        <label className="form-label" htmlFor="detail-status">
          Update status
        </label>
        <StatusSelect applicationId={application.id} status={application.status} />
      </div>
    </div>
  );
}
