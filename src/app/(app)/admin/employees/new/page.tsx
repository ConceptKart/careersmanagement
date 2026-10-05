import type { Metadata } from "next";
import { createEmployeeAction } from "@/actions/admin-employees";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmployeeForm } from "@/components/admin/employees/EmployeeForm";
import { requireAdmin } from "@/lib/auth/guards";
import { employeesService } from "@/services/employees.service";

export const metadata: Metadata = {
  title: "New Employee",
  description: "Create an employee record.",
};

export default async function AdminNewEmployeePage() {
  await requireAdmin();
  const managers = await employeesService.listManagerOptions();

  return (
    <>
      <PageHeader
        title="Add employee"
        description="Create a new employee record."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Employees", href: "/admin/employees" },
          { label: "New" },
        ]}
      />

      <div className="card admin-job-form-card">
        <EmployeeForm
          mode="create"
          cancelHref="/admin/employees"
          submitAction={createEmployeeAction}
          managers={managers}
          defaultValues={{
            fullName: "",
            email: "",
            phone: undefined,
            position: "",
            department: "",
            employmentType: "full_time",
            dateOfJoining: "",
            salary: undefined,
            managerId: undefined,
            status: "active",
            notes: undefined,
          }}
        />
      </div>
    </>
  );
}
