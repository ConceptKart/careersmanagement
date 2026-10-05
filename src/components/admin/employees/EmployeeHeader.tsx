import Link from "next/link";
import type { AdminEmployeeDetail } from "@/repositories/employees.repository";
import {
  formatDate,
  getEmployeeStatusClass,
  getEmployeeStatusLabel,
  getJobTypeLabel,
} from "@/lib/utils/labels";

type Props = {
  employee: AdminEmployeeDetail;
};

export function EmployeeHeader({ employee }: Props) {
  return (
    <div className="admin-app-header card mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={getEmployeeStatusClass(employee.status)}>
              {getEmployeeStatusLabel(employee.status)}
            </span>
            <span className="badge badge-gray">
              {getJobTypeLabel(employee.employmentType)}
            </span>
          </div>
          <h1 className="text-xl font-semibold">{employee.fullName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {employee.position} · {employee.department}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Joined {formatDate(employee.dateOfJoining)}
            {employee.dateOfExit
              ? ` · Exit ${formatDate(employee.dateOfExit)}`
              : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/employees/${employee.id}/edit`}
            className="btn btn-primary btn-sm"
          >
            Edit employee
          </Link>
          <Link href="/admin/employees" className="btn btn-outline btn-sm">
            Back to list
          </Link>
        </div>
      </div>
    </div>
  );
}
