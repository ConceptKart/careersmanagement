import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmployeeDocFilters } from "@/components/admin/employee-documents/EmployeeDocFilters";
import { EmployeeDocumentsBrowser } from "@/components/admin/employee-documents/EmployeeDocumentsBrowser";
import { JobPagination } from "@/components/jobs/admin/JobPagination";
import { requireAdmin } from "@/lib/auth/guards";
import { employeesService } from "@/services/employees.service";
import { adminEmployeeDocListFiltersSchema } from "@/validators/admin-salary.schema";

export const metadata: Metadata = {
  title: "Employee Documents",
  description: "Browse employee documents across the organization.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminEmployeeDocumentsPage({
  searchParams,
}: Props) {
  await requireAdmin();
  const raw = await searchParams;
  const parsed = adminEmployeeDocListFiltersSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    employeeId: typeof raw.employeeId === "string" ? raw.employeeId : "",
    type: typeof raw.type === "string" ? raw.type : "all",
    page: typeof raw.page === "string" ? raw.page : "1",
  });
  const filters = parsed.success
    ? parsed.data
    : { q: "", employeeId: "", type: "all" as const, page: 1 };

  const [list, employees] = await Promise.all([
    employeesService.getAdminDocuments(filters),
    employeesService.listEmployeeOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Employee Documents"
        description={`${list.total} document${list.total === 1 ? "" : "s"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Employee Documents" },
        ]}
      />

      <Suspense fallback={<div className="admin-app-filters">Loading…</div>}>
        <EmployeeDocFilters employees={employees} />
      </Suspense>

      <div className="card mt-6">
        <EmployeeDocumentsBrowser documents={list.documents} />
        <JobPagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          basePath="/admin/employee-documents"
          itemLabel="document"
          searchParams={{
            q: filters.q || undefined,
            employeeId: filters.employeeId || undefined,
            type: filters.type !== "all" ? filters.type : undefined,
          }}
        />
      </div>
    </>
  );
}
