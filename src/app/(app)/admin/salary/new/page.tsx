import type { Metadata } from "next";
import { createSalaryRecordAction } from "@/actions/admin-salary";
import { PageHeader } from "@/components/admin/PageHeader";
import { SalaryForm } from "@/components/admin/salary/SalaryForm";
import { requireAdmin } from "@/lib/auth/guards";
import { salaryRecordsService } from "@/services/salary-records.service";

export const metadata: Metadata = { title: "New Salary Record" };

export default async function AdminNewSalaryPage() {
  await requireAdmin();
  const employees = await salaryRecordsService.listEmployeeOptions();

  return (
    <>
      <PageHeader
        title="Add salary record"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Salary Records", href: "/admin/salary" },
          { label: "New" },
        ]}
      />
      <div className="card admin-job-form-card">
        <SalaryForm
          mode="create"
          employees={employees}
          cancelHref="/admin/salary"
          submitAction={createSalaryRecordAction}
          defaultValues={{
            employeeId: "",
            month: "",
            basicSalary: "",
            hra: "0",
            allowances: "0",
            deductions: "0",
            netSalary: "",
            paidOn: undefined,
          }}
        />
      </div>
    </>
  );
}
