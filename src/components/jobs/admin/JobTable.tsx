import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { JobActions } from "@/components/jobs/admin/JobActions";
import { JobStatusBadge } from "@/components/jobs/admin/JobStatusBadge";
import { PublishToggle } from "@/components/jobs/admin/PublishToggle";
import { formatDate, getJobTypeLabel } from "@/lib/utils/labels";
import type { AdminJobListItem } from "@/repositories/jobs.repository";

type Props = {
  jobs: AdminJobListItem[];
};

export function JobTable({ jobs }: Props) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs found"
        message="Try adjusting filters, or create a new job posting."
      />
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Department</th>
            <th>Location</th>
            <th>Type</th>
            <th>Status</th>
            <th>Apps</th>
            <th>Created</th>
            <th>Publish</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <Link href={`/admin/jobs/${job.id}`} className="admin-table-primary">
                  {job.title}
                </Link>
              </td>
              <td>{job.department}</td>
              <td>{job.location}</td>
              <td>{getJobTypeLabel(job.jobType)}</td>
              <td>
                <JobStatusBadge isActive={job.isActive} />
              </td>
              <td>{job.applicationsCount}</td>
              <td>{formatDate(job.createdAt)}</td>
              <td>
                <PublishToggle jobId={job.id} isActive={job.isActive} />
              </td>
              <td>
                <JobActions
                  jobId={job.id}
                  isActive={job.isActive}
                  applicationsCount={job.applicationsCount}
                  compact
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
