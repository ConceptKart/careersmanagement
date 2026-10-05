import type { AdminEmployeeDetail } from "@/repositories/employees.repository";
import {
  formatDate,
  formatINR,
  getEmployeeStatusLabel,
  getJobTypeLabel,
} from "@/lib/utils/labels";

type Props = {
  employee: AdminEmployeeDetail;
};

export function EmployeeProfile({ employee }: Props) {
  return (
    <div className="admin-app-detail-grid">
      <section className="card">
        <h2>Personal information</h2>
        <dl className="admin-dl">
          <div>
            <dt>Full name</dt>
            <dd>{employee.fullName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{employee.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{employee.phone ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>Employment information</h2>
        <dl className="admin-dl">
          <div>
            <dt>Designation</dt>
            <dd>{employee.position}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{employee.department}</dd>
          </div>
          <div>
            <dt>Employment type</dt>
            <dd>{getJobTypeLabel(employee.employmentType)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{getEmployeeStatusLabel(employee.status)}</dd>
          </div>
          <div>
            <dt>Manager</dt>
            <dd>{employee.manager?.fullName ?? "—"}</dd>
          </div>
          <div>
            <dt>Joining date</dt>
            <dd>{formatDate(employee.dateOfJoining)}</dd>
          </div>
          <div>
            <dt>Exit date</dt>
            <dd>
              {employee.dateOfExit ? formatDate(employee.dateOfExit) : "—"}
            </dd>
          </div>
          <div>
            <dt>Current salary</dt>
            <dd>{formatINR(employee.salary)}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>Linked user account</h2>
        {employee.linkedUser ? (
          <dl className="admin-dl">
            <div>
              <dt>Status</dt>
              <dd>
                <span className="badge badge-emerald">Linked</span>
              </dd>
            </div>
            <div>
              <dt>User email</dt>
              <dd>{employee.linkedUser.email}</dd>
            </div>
            <div>
              <dt>User ID</dt>
              <dd className="font-mono text-sm">{employee.linkedUser.id}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Not linked to a portal user account. Linking is managed via{" "}
            <code>employees.user_id</code> (no invite flow in PHP admin).
          </p>
        )}
      </section>

      {employee.notes ? (
        <section className="card">
          <h2>Notes</h2>
          <div className="admin-prose">{employee.notes}</div>
        </section>
      ) : null}
    </div>
  );
}
