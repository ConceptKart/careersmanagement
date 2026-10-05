import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateEmployeeAction } from "@/actions/admin-employees";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmployeeForm } from "@/components/admin/employees/EmployeeForm";
import { requireAdmin } from "@/lib/auth/guards";
import { toDateInputValue } from "@/lib/utils/labels";
import { employeesService } from "@/services/employees.service";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const employee = await employeesService.getEmployee(id);
  return { title: employee ? `Edit ${employee.fullName}` : "Edit Employee" };
}

export const dynamic = "force-dynamic";

export default async function AdminEditEmployeePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [employee, managers] = await Promise.all([
    employeesService.getEmployee(id),
    employeesService.listManagerOptions(id),
  ]);

  if (!employee) notFound();

  const submitAction = updateEmployeeAction.bind(null, id);

  return (
    <>
      <PageHeader
        title={`Edit ${employee.fullName}`}
        description="Update employment details."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Employees", href: "/admin/employees" },
          { label: employee.fullName, href: `/admin/employees/${id}` },
          { label: "Edit" },
        ]}
      />

      <div className="card admin-job-form-card">
        <EmployeeForm
          mode="edit"
          email={employee.email}
          cancelHref={`/admin/employees/${id}`}
          submitAction={submitAction}
          managers={managers}
          defaultValues={{
            fullName: employee.fullName,
            phone: employee.phone ?? undefined,
            position: employee.position,
            department: employee.department,
            employmentType: employee.employmentType,
            dateOfJoining: toDateInputValue(employee.dateOfJoining),
            dateOfExit: toDateInputValue(employee.dateOfExit) || undefined,
            salary: employee.salary ?? undefined,
            managerId: employee.managerId ?? undefined,
            status: employee.status,
            notes: employee.notes ?? undefined,
          }}
        />
      </div>
    </>
  );
}
