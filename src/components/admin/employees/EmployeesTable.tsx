import Link from "next/link";
import type { AdminEmployeeListItem } from "@/repositories/employees.repository";
import {
  formatDate,
  formatINR,
  getEmployeeStatusClass,
  getEmployeeStatusLabel,
  getJobTypeLabel,
} from "@/lib/utils/labels";

type Props = {
  employees: AdminEmployeeListItem[];
};

export function EmployeesTable({ employees }: Props) {
  if (employees.length === 0) {
    return (
      <div className="admin-empty-state">
        <p>No employees found.</p>
        <Link href="/admin/employees/new" className="btn btn-primary btn-sm mt-3">
          Add employee
        </Link>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Joining Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="font-mono text-sm" title={employee.id}>
                {employee.id.slice(0, 8)}…
              </td>
              <td>
                <div className="font-medium">{employee.fullName}</div>
                <div className="text-sm text-muted-foreground">
                  {getJobTypeLabel(employee.employmentType)}
                  {employee.salary ? ` · ${formatINR(employee.salary)}` : ""}
                </div>
              </td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>{employee.position}</td>
              <td>{formatDate(employee.dateOfJoining)}</td>
              <td>
                <span className={getEmployeeStatusClass(employee.status)}>
                  {getEmployeeStatusLabel(employee.status)}
                </span>
              </td>
              <td>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/employees/${employee.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/employees/${employee.id}/edit`}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
