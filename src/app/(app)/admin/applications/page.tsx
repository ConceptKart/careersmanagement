import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ApplicationFilters } from "@/components/admin/applications/ApplicationFilters";
import { ApplicationsTable } from "@/components/admin/applications/ApplicationsTable";
import { JobPagination } from "@/components/jobs/admin/JobPagination";
import { applicationsService } from "@/services/applications.service";
import { adminApplicationListFiltersSchema } from "@/validators/admin-application.schema";

export const metadata: Metadata = {
  title: "Applications",
  description: "Review and manage candidate applications.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminApplicationsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const parsed = adminApplicationListFiltersSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    job: typeof raw.job === "string" ? raw.job : "",
    status: typeof raw.status === "string" ? raw.status : "all",
    priority: typeof raw.priority === "string" ? raw.priority : "all",
    dateFrom: typeof raw.dateFrom === "string" ? raw.dateFrom : "",
    dateTo: typeof raw.dateTo === "string" ? raw.dateTo : "",
    sort: typeof raw.sort === "string" ? raw.sort : "recent",
    page: typeof raw.page === "string" ? raw.page : "1",
  });

  const filters = parsed.success
    ? parsed.data
    : {
        q: "",
        job: "",
        status: "all" as const,
        priority: "all" as const,
        dateFrom: "",
        dateTo: "",
        sort: "recent" as const,
        page: 1,
      };

  const [list, jobs] = await Promise.all([
    applicationsService.getApplications(filters),
    applicationsService.listJobOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Applications"
        description={`${list.total} application${list.total === 1 ? "" : "s"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Applications" },
        ]}
      />

      <Suspense fallback={<div className="admin-app-filters">Loading filters…</div>}>
        <ApplicationFilters jobs={jobs} />
      </Suspense>

      <div className="card mt-6">
        <ApplicationsTable applications={list.applications} />
        <JobPagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          basePath="/admin/applications"
          itemLabel="application"
          searchParams={{
            q: filters.q || undefined,
            job: filters.job || undefined,
            status: filters.status !== "all" ? filters.status : undefined,
            priority: filters.priority !== "all" ? filters.priority : undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
            sort: filters.sort !== "recent" ? filters.sort : undefined,
          }}
        />
      </div>
    </>
  );
}
