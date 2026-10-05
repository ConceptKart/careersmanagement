import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmployeeFilters } from "@/components/admin/employees/EmployeeFilters";
import { EmployeesTable } from "@/components/admin/employees/EmployeesTable";
import { JobPagination } from "@/components/jobs/admin/JobPagination";
import { requireAdmin } from "@/lib/auth/guards";
import { employeesService } from "@/services/employees.service";
import { adminEmployeeListFiltersSchema } from "@/validators/admin-employee.schema";

export const metadata: Metadata = {
  title: "Employees",
  description: "Manage employee records, salary, and documents.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminEmployeesPage({ searchParams }: Props) {
  await requireAdmin();

  const raw = await searchParams;
  const parsed = adminEmployeeListFiltersSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    department: typeof raw.department === "string" ? raw.department : "",
    status: typeof raw.status === "string" ? raw.status : "all",
    sort: typeof raw.sort === "string" ? raw.sort : "recent",
    page: typeof raw.page === "string" ? raw.page : "1",
  });

  const filters = parsed.success
    ? parsed.data
    : {
        q: "",
        department: "",
        status: "all" as const,
        sort: "recent" as const,
        page: 1,
      };

  const [list, departments] = await Promise.all([
    employeesService.getEmployees(filters),
    employeesService.listDepartments(),
  ]);

  return (
    <>
      <PageHeader
        title="Employees"
        description={`${list.total} employee${list.total === 1 ? "" : "s"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Employees" },
        ]}
        actions={
          <Link href="/admin/employees/new" className="btn btn-primary btn-sm">
            Add employee
          </Link>
        }
      />

      <Suspense fallback={<div className="admin-app-filters">Loading filters…</div>}>
        <EmployeeFilters departments={departments} />
      </Suspense>

      <div className="card mt-6">
        <EmployeesTable employees={list.employees} />
        <JobPagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          basePath="/admin/employees"
          itemLabel="employee"
          searchParams={{
            q: filters.q || undefined,
            department: filters.department || undefined,
            status: filters.status !== "all" ? filters.status : undefined,
            sort: filters.sort !== "recent" ? filters.sort : undefined,
          }}
        />
      </div>
    </>
  );
}
