import type { PortalSalaryRecord } from "@/repositories/portal.repository";
import { formatINR } from "@/lib/utils/labels";

type Props = {
  records: PortalSalaryRecord[];
};

export function SalaryHistory({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="card">
        <p className="text-sm text-muted-foreground">
          No salary records available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Basic</th>
              <th>HRA</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row) => (
              <tr key={row.id}>
                <td>{row.month}</td>
                <td>{formatINR(row.basicSalary)}</td>
                <td>{formatINR(row.hra)}</td>
                <td>{formatINR(row.allowances)}</td>
                <td>{formatINR(row.deductions)}</td>
                <td>{formatINR(row.netSalary)}</td>
                <td>
                  {row.paidOn ? (
                    <span className="badge badge-emerald">Paid</span>
                  ) : (
                    <span className="badge badge-amber">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
