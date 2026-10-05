import { Suspense } from "react";
import type { Metadata } from "next";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobList } from "@/components/jobs/JobList";
import { jobsService } from "@/services/jobs.service";
import { jobListFiltersSchema } from "@/validators/application.schema";

export const metadata: Metadata = {
  title: "Open Roles — Concept Kart Careers",
  description:
    "Browse open roles at Concept Kart across engineering, product, design, and operations.",
};

/** Revalidate listing every 60s — active jobs change infrequently. */
export const revalidate = 60;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Phase 1B — Public careers listing.
 * PHP reference: jobs.php (active jobs, filters, job grid).
 */
export default async function JobsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const filters = jobListFiltersSchema.parse({
    q: typeof raw.q === "string" ? raw.q : "",
    dept: typeof raw.dept === "string" ? raw.dept : "",
    loc: typeof raw.loc === "string" ? raw.loc : "",
    type: typeof raw.type === "string" ? raw.type : "",
  });

  const [jobs, departments, locations] = await Promise.all([
    jobsService.listPublic(filters),
    jobsService.listDepartments(),
    jobsService.listLocations(),
  ]);

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "3rem" }}>
      <div className="page-header">
        <h1 className="page-title">Open Roles</h1>
        <p className="page-description">Join our team today!</p>
      </div>

      <Suspense fallback={<FiltersSkeleton />}>
        <JobFilters
          departments={departments}
          locations={locations}
          initialQ={filters.q}
          initialDept={filters.dept}
          initialLoc={filters.loc}
        />
      </Suspense>

      <JobList jobs={jobs} />
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="jobs-filter-form" aria-hidden>
      <div className="filter-row">
        <div className="filter-search">
          <div className="form-input" style={{ height: 40, background: "var(--muted)" }} />
        </div>
      </div>
    </div>
  );
}
