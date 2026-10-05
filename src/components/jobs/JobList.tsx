import { EmptyState } from "@/components/jobs/EmptyState";
import { JobCard } from "@/components/jobs/JobCard";
import type { PublicJob } from "@/repositories/jobs.repository";

type Props = {
  jobs: PublicJob[];
};

/** Server component list — grid of JobCards or empty state. */
export function JobList({ jobs }: Props) {
  if (jobs.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <p className="text-sm text-muted mb-4">
        {jobs.length} role{jobs.length !== 1 ? "s" : ""} found
      </p>
      <div className="job-grid">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </>
  );
}
