import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SalaryFilters } from "@/components/admin/salary/SalaryFilters";
import { SalaryTable } from "@/components/admin/salary/SalaryTable";
import { JobPagination } from "@/components/jobs/admin/JobPagination";
import { requireAdmin } from "@/lib/auth/guards";
import { salaryRecordsService } from "@/services/salary-records.service";
import { adminSalaryListFiltersSchema } from "@/validators/admin-salary.schema";

export const metadata: Metadata = {
  title: "Salary Records",
  description: "Manage monthly salary records.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSalaryPage({ searchParams }: Props) {
  await requireAdmin();
  const raw = await searchParams;
  const parsed = adminSalaryListFiltersSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    employeeId: typeof raw.employeeId === "string" ? raw.employeeId : "",
    month: typeof raw.month === "string" ? raw.month : "",
    page: typeof raw.page === "string" ? raw.page : "1",
  });
  const filters = parsed.success
    ? parsed.data
    : { q: "", employeeId: "", month: "", page: 1 };

  const [list, employees] = await Promise.all([
    salaryRecordsService.getRecords(filters),
    salaryRecordsService.listEmployeeOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Salary Records"
        description={`${list.total} record${list.total === 1 ? "" : "s"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Salary Records" },
        ]}
        actions={
          <Link href="/admin/salary/new" className="btn btn-primary btn-sm">
            Add record
          </Link>
        }
      />

      <Suspense fallback={<div className="admin-app-filters">Loading…</div>}>
        <SalaryFilters employees={employees} />
      </Suspense>

      <div className="card mt-6">
        <SalaryTable records={list.records} />
        <JobPagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          basePath="/admin/salary"
          itemLabel="record"
          searchParams={{
            q: filters.q || undefined,
            employeeId: filters.employeeId || undefined,
            month: filters.month || undefined,
          }}
        />
      </div>
    </>
  );
}
