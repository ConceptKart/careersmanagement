import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateSalaryRecordAction } from "@/actions/admin-salary";
import { PageHeader } from "@/components/admin/PageHeader";
import { SalaryForm } from "@/components/admin/salary/SalaryForm";
import { requireAdmin } from "@/lib/auth/guards";
import { toDateInputValue } from "@/lib/utils/labels";
import { salaryRecordsService } from "@/services/salary-records.service";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await salaryRecordsService.getRecord(id);
  return {
    title: row ? `Edit ${row.month} — ${row.employeeName}` : "Edit Salary",
  };
}

export const dynamic = "force-dynamic";

export default async function AdminEditSalaryPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const [row, employees] = await Promise.all([
    salaryRecordsService.getRecord(id),
    salaryRecordsService.listEmployeeOptions(),
  ]);
  if (!row) notFound();

  const submitAction = updateSalaryRecordAction.bind(null, id);

  return (
    <>
      <PageHeader
        title={`Edit ${row.month}`}
        description={row.employeeName}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Salary Records", href: "/admin/salary" },
          { label: "Edit" },
        ]}
      />
      <div className="card admin-job-form-card">
        <SalaryForm
          mode="edit"
          employees={employees}
          cancelHref="/admin/salary"
          submitAction={submitAction}
          defaultValues={{
            employeeId: row.employeeId,
            month: row.month,
            basicSalary: row.basicSalary,
            hra: row.hra ?? "0",
            allowances: row.allowances ?? "0",
            deductions: row.deductions ?? "0",
            netSalary: row.netSalary,
            paidOn: toDateInputValue(row.paidOn) || undefined,
          }}
        />
      </div>
    </>
  );
}
