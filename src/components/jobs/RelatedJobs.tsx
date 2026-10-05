import Link from "next/link";
import { formatDate, getJobTypeLabel } from "@/lib/utils/labels";
import { jobDetailPath } from "@/lib/utils/job-slug";
import type { RelatedJob } from "@/repositories/jobs.repository";

type Props = {
  jobs: RelatedJob[];
};

export function RelatedJobs({ jobs }: Props) {
  if (jobs.length === 0) return null;

  return (
    <section className="job-related" aria-labelledby="related-jobs-heading">
      <h2 id="related-jobs-heading" className="job-related-title">
        Related Roles
      </h2>
      <ul className="job-related-list">
        {jobs.map((job) => (
          <li key={job.id}>
            <article className="job-related-card">
              <h3 className="job-related-card-title">
                <Link href={jobDetailPath(job)}>{job.title}</Link>
              </h3>
              <p className="job-related-card-meta">
                {job.department} · {job.location} · {getJobTypeLabel(job.jobType)}
              </p>
              <p className="job-related-card-date">Posted {formatDate(job.createdAt)}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
