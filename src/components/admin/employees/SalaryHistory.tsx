import type { AdminSalaryRecord } from "@/repositories/employees.repository";
import { formatDate, formatINR } from "@/lib/utils/labels";

type Props = {
  currentSalary: string | null;
  records: AdminSalaryRecord[];
};

export function SalaryHistory({ currentSalary, records }: Props) {
  return (
    <section className="card mt-6">
      <h2>Salary</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Current salary on employee record:{" "}
        <strong>{formatINR(currentSalary)}</strong>
      </p>

      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No salary history records yet.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Basic</th>
                <th>HRA</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net</th>
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
                      <span className="badge badge-emerald">
                        Paid {formatDate(row.paidOn)}
                      </span>
                    ) : (
                      <span className="badge badge-amber">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
