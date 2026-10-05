import type { PortalEmployeeProfile } from "@/repositories/portal.repository";
import {
  formatDate,
  formatINR,
  getEmployeeStatusLabel,
  getJobTypeLabel,
} from "@/lib/utils/labels";

type Props = {
  employee: PortalEmployeeProfile;
};

export function ProfileCard({ employee }: Props) {
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
            <dt>Joining date</dt>
            <dd>{formatDate(employee.dateOfJoining)}</dd>
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
              <dt>Login email</dt>
              <dd>{employee.linkedUser.email}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">Not linked.</p>
        )}
      </section>
    </div>
  );
}
