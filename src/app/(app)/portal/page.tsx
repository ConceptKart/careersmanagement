import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAuth } from "@/lib/auth/guards";
import {
  formatDate,
  formatINR,
  getEmployeeStatusLabel,
  getJobTypeLabel,
} from "@/lib/utils/labels";
import { portalService } from "@/services/portal.service";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function PortalHomePage() {
  const session = await requireAuth();
  const employee = await portalService.getEmployeeProfile(session.user.id);

  if (!employee) {
    return (
      <>
        <PageHeader
          title="Welcome"
          breadcrumbs={[{ label: "Portal" }]}
        />
        <div className="card" style={{ maxWidth: "40rem" }}>
          <h2 className="font-semibold mb-2">Welcome</h2>
          <p className="text-sm text-muted-foreground">
            Your employee record hasn&apos;t been set up yet. Please contact HR.
          </p>
        </div>
      </>
    );
  }

  const firstName = employee.fullName.split(" ")[0] ?? employee.fullName;

  return (
    <>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description={`${employee.position} · ${employee.department}`}
        breadcrumbs={[{ label: "Portal" }]}
      />

      <div className="portal-grid mb-6">
        <div className="portal-stat card">
          <div className="text-sm text-muted-foreground">Department</div>
          <div className="font-semibold mt-1">{employee.department}</div>
        </div>
        <div className="portal-stat card">
          <div className="text-sm text-muted-foreground">Position</div>
          <div className="font-semibold mt-1">{employee.position}</div>
        </div>
        <div className="portal-stat card">
          <div className="text-sm text-muted-foreground">Joined</div>
          <div className="font-semibold mt-1">
            {formatDate(employee.dateOfJoining)}
          </div>
        </div>
        <div className="portal-stat card">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="font-semibold mt-1">
            {getEmployeeStatusLabel(employee.status)}
          </div>
        </div>
      </div>

      <section className="card mb-6">
        <h2 className="mb-3">At a glance</h2>
        <dl className="admin-dl">
          <div>
            <dt>Employment type</dt>
            <dd>{getJobTypeLabel(employee.employmentType)}</dd>
          </div>
          <div>
            <dt>Salary</dt>
            <dd>{formatINR(employee.salary)}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2 className="mb-3">Quick links</h2>
        <div className="quick-links">
          <Link href="/portal/profile" className="quick-link">
            <h3 className="font-semibold">Personal details</h3>
            <p className="text-sm text-muted-foreground mt-1">View your profile</p>
          </Link>
          <Link href="/portal/salary" className="quick-link">
            <h3 className="font-semibold">Salary information</h3>
            <p className="text-sm text-muted-foreground mt-1">Monthly records</p>
          </Link>
          <Link href="/portal/documents" className="quick-link">
            <h3 className="font-semibold">Documents</h3>
            <p className="text-sm text-muted-foreground mt-1">Offer letters & slips</p>
          </Link>
          <Link href="/portal/achievements" className="quick-link">
            <h3 className="font-semibold">Achievements</h3>
            <p className="text-sm text-muted-foreground mt-1">Your recognition</p>
          </Link>
          <Link href="/portal/company-documents" className="quick-link">
            <h3 className="font-semibold">Company docs</h3>
            <p className="text-sm text-muted-foreground mt-1">Policies & handbook</p>
          </Link>
          <Link href="/portal/feedback" className="quick-link">
            <h3 className="font-semibold">Feedback</h3>
            <p className="text-sm text-muted-foreground mt-1">Share with HR</p>
          </Link>
        </div>
      </section>
    </>
  );
}
