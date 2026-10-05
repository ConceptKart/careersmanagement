import { formatDate, getJobTypeLabel } from "@/lib/utils/labels";
import { extractExperience } from "@/lib/utils/job-display";
import type { JobDetail } from "@/repositories/jobs.repository";

type Props = {
  job: JobDetail;
};

export function JobDetailHero({ job }: Props) {
  const experience = extractExperience(job.requirements);
  const typeClass = jobTypeBadgeClass(job.jobType);

  return (
    <header className="job-detail-hero">
      <h1 className="job-detail-title">{job.title}</h1>

      <div className="job-meta job-detail-meta">
        <span>
          <MetaIcon kind="dept" />
          {job.department}
        </span>
        <span>
          <MetaIcon kind="loc" />
          {job.location}
        </span>
        <span className={`badge badge-type ${typeClass}`}>{getJobTypeLabel(job.jobType)}</span>
        {experience && (
          <span>
            <MetaIcon kind="exp" />
            {experience}
          </span>
        )}
        {job.salaryOffered && (
          <span>
            <MetaIcon kind="pay" />
            {job.salaryOffered}
          </span>
        )}
        <span>
          <MetaIcon kind="date" />
          Posted {formatDate(job.createdAt)}
        </span>
      </div>

      <div className="job-detail-hero-footer">
        <span
          className={`badge job-status-badge ${job.isActive ? "job-status-open" : "job-status-closed"}`}
        >
          {job.isActive ? "Open" : "Closed"}
        </span>
      </div>
    </header>
  );
}

function jobTypeBadgeClass(type: string): string {
  switch (type) {
    case "full_time":
    case "full-time":
      return "badge-type-full";
    case "part_time":
    case "part-time":
      return "badge-type-part";
    case "contract":
      return "badge-type-contract";
    case "internship":
      return "badge-type-intern";
    default:
      return "badge-type-full";
  }
}

function MetaIcon({ kind }: { kind: "dept" | "loc" | "exp" | "pay" | "date" }) {
  if (kind === "dept") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  }
  if (kind === "loc") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }
  if (kind === "exp") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  if (kind === "pay") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
