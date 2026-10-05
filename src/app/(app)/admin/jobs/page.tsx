import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminToast } from "@/components/admin/AdminToast";
import { JobFilters } from "@/components/jobs/admin/JobFilters";
import { JobPagination } from "@/components/jobs/admin/JobPagination";
import { JobTable } from "@/components/jobs/admin/JobTable";
import { jobsService } from "@/services/jobs.service";
import { adminJobListFiltersSchema } from "@/validators/admin-job.schema";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Create and manage open roles.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminJobsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const parsed = adminJobListFiltersSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    dept: typeof raw.dept === "string" ? raw.dept : "",
    loc: typeof raw.loc === "string" ? raw.loc : "",
    status: typeof raw.status === "string" ? raw.status : "all",
    page: typeof raw.page === "string" ? raw.page : "1",
  });

  const filters = parsed.success
    ? parsed.data
    : { q: "", dept: "", loc: "", status: "all" as const, page: 1 };

  const [list, departments, locations] = await Promise.all([
    jobsService.getJobs(filters),
    jobsService.listAdminDepartments(),
    jobsService.listAdminLocations(),
  ]);

  return (
    <>
      <Suspense fallback={null}>
        <AdminToast />
      </Suspense>

      <PageHeader
        title="Jobs"
        description="Create and manage open roles."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Jobs" },
        ]}
        actions={
          <Link href="/admin/jobs/new" className="btn btn-primary">
            New job
          </Link>
        }
      />

      <Suspense fallback={<div className="admin-job-filters">Loading filters…</div>}>
        <JobFilters departments={departments} locations={locations} />
      </Suspense>

      <div className="card mt-6">
        <JobTable jobs={list.jobs} />
        <JobPagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          searchParams={{
            q: filters.q || undefined,
            dept: filters.dept || undefined,
            loc: filters.loc || undefined,
            status: filters.status !== "all" ? filters.status : undefined,
          }}
        />
      </div>
    </>
  );
}
