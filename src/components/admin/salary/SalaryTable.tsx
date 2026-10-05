"use client";

import Link from "next/link";
import type { AdminSalaryListItem } from "@/repositories/salary-records.repository";
import { formatDate, formatINR } from "@/lib/utils/labels";

type Props = { records: AdminSalaryListItem[] };

export function SalaryTable({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="admin-empty-state">
        <p>No salary records yet.</p>
        <Link href="/admin/salary/new" className="btn btn-primary btn-sm mt-3">
          Add salary record
        </Link>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Month</th>
            <th>Basic</th>
            <th>Net</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((row) => (
            <tr key={row.id}>
              <td>
                <Link
                  href={`/admin/employees/${row.employeeId}`}
                  className="text-primary"
                >
                  {row.employeeName}
                </Link>
              </td>
              <td>{row.month}</td>
              <td>{formatINR(row.basicSalary)}</td>
              <td>{formatINR(row.netSalary)}</td>
              <td>
                {row.paidOn ? (
                  <span className="badge badge-emerald">
                    Paid {formatDate(row.paidOn)}
                  </span>
                ) : (
                  <span className="badge badge-amber">Pending</span>
                )}
              </td>
              <td>
                <Link
                  href={`/admin/salary/${row.id}/edit`}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
