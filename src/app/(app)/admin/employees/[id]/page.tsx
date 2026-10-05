import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { uploadEmployeeDocumentAction } from "@/actions/admin-employees";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmployeeDocuments } from "@/components/admin/employees/EmployeeDocuments";
import { EmployeeHeader } from "@/components/admin/employees/EmployeeHeader";
import { EmployeeProfile } from "@/components/admin/employees/EmployeeProfile";
import { SalaryHistory } from "@/components/admin/employees/SalaryHistory";
import { requireAdmin } from "@/lib/auth/guards";
import { employeesService } from "@/services/employees.service";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const employee = await employeesService.getEmployee(id);
  return { title: employee ? employee.fullName : "Employee" };
}

export const dynamic = "force-dynamic";

export default async function AdminEmployeeDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const employee = await employeesService.getEmployee(id);
  if (!employee) notFound();

  const uploadAction = uploadEmployeeDocumentAction.bind(null, id);

  return (
    <>
      <PageHeader
        title={employee.fullName}
        description={`${employee.position} · ${employee.department}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Employees", href: "/admin/employees" },
          { label: employee.fullName },
        ]}
      />

      <EmployeeHeader employee={employee} />
      <EmployeeProfile employee={employee} />
      <SalaryHistory
        currentSalary={employee.salary}
        records={employee.salaryRecords}
      />
      <EmployeeDocuments
        employeeId={employee.id}
        documents={employee.documents}
        uploadAction={uploadAction}
      />
    </>
  );
}
