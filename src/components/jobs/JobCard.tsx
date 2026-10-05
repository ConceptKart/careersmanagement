import Link from "next/link";
import { formatDate, getJobTypeLabel } from "@/lib/utils/labels";
import { extractExperience, shortDescription } from "@/lib/utils/job-display";
import { jobDetailPath, jobApplyPath } from "@/lib/utils/job-slug";
import type { PublicJob } from "@/repositories/jobs.repository";

type Props = {
  job: PublicJob;
};

/**
 * PHP reference (jobs.php job-card) enriched for Phase 1B fields:
 * title, dept, location, type, experience, salary, short description, date, CTAs.
 */
export function JobCard({ job }: Props) {
  const experience = extractExperience(job.requirements);
  const blurb = shortDescription(job.description);
  const typeClass = jobTypeBadgeClass(job.jobType);

  return (
    <article className="job-card">
      <div className="job-card-header">
        <Link href={jobDetailPath(job)} className="job-card-title">
          {job.title}
        </Link>
        <span className={`badge badge-type ${typeClass}`}>{getJobTypeLabel(job.jobType)}</span>
      </div>

      <div className="job-card-meta">
        <span>
          <MetaIcon kind="dept" />
          {job.department}
        </span>
        <span>
          <MetaIcon kind="loc" />
          {job.location}
        </span>
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
      </div>

      <p className="job-card-blurb">{blurb}</p>

      <div className="job-card-footer">
        <span className="job-card-date">Posted {formatDate(job.createdAt)}</span>
        <div className="job-card-actions">
          <Link href={jobDetailPath(job)} className="btn btn-outline btn-sm">
            View Details
          </Link>
          <Link href={jobApplyPath(job)} className="btn btn-primary btn-sm">
            Apply
          </Link>
        </div>
      </div>
    </article>
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

function MetaIcon({ kind }: { kind: "dept" | "loc" | "exp" | "pay" }) {
  if (kind === "dept") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M20 7h-4V3" />
        <path d="M14 3h-4" />
        <rect x="2" y="7" width="20" height="5" rx="1" />
        <path d="M4 12v8" />
        <path d="M20 12v8" />
      </svg>
    );
  }
  if (kind === "loc") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
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
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
