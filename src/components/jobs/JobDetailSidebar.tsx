import Link from "next/link";
import { formatDate, getJobTypeLabel } from "@/lib/utils/labels";
import { extractExperience } from "@/lib/utils/job-display";
import { jobApplyPath } from "@/lib/utils/job-slug";
import type { JobDetail } from "@/repositories/jobs.repository";

type Props = {
  job: JobDetail;
};

export function JobDetailSidebar({ job }: Props) {
  const experience = extractExperience(job.requirements);

  return (
    <aside className="job-detail-sidebar" aria-label="Role summary">
      <h2 className="job-sidebar-title">Role Summary</h2>

      <dl className="job-sidebar-facts">
        <SidebarFact label="Department" value={job.department} />
        <SidebarFact label="Employment Type" value={getJobTypeLabel(job.jobType)} />
        {experience && <SidebarFact label="Experience" value={experience} />}
        {job.salaryOffered && <SidebarFact label="Salary" value={job.salaryOffered} />}
        <SidebarFact label="Location" value={job.location} />
        <SidebarFact label="Posted" value={formatDate(job.createdAt)} />
      </dl>

      <div className="job-sidebar-cta">
        {job.isActive ? (
          <Link href={jobApplyPath(job)} className="btn btn-primary btn-lg job-apply-btn">
            Apply Now
          </Link>
        ) : (
          <p className="job-sidebar-closed">This role is no longer accepting applications.</p>
        )}
      </div>
    </aside>
  );
}

function SidebarFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="job-sidebar-fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
