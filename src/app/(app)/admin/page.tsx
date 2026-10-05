import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { QuickActions } from "@/components/admin/QuickActions";
import { RecentApplicationsTable } from "@/components/admin/RecentApplicationsTable";
import { RecentJobsTable } from "@/components/admin/RecentJobsTable";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { dashboardService } from "@/services/dashboard.service";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin overview of jobs, applications, and employees.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { stats, recentApplications, recentJobs } =
    await dashboardService.getDashboard();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of people, feedback, and recruiting."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]}
      />

      <StatsGrid stats={stats} />

      <section className="admin-section admin-section-spaced">
        <h2 className="admin-section-title">Quick actions</h2>
        <QuickActions />
      </section>

      <section className="admin-dashboard-panels">
        <article className="admin-panel">
          <header className="admin-panel-header">
            <div>
              <h2 className="admin-panel-title">Recent applications</h2>
              <p className="admin-panel-subtitle">
                {recentApplications.length} latest
                {recentApplications.length === 1 ? " submission" : " submissions"}
              </p>
            </div>
            <Link href="/admin/applications" className="admin-panel-link">
              View all
            </Link>
          </header>
          <RecentApplicationsTable applications={recentApplications} />
        </article>

        <article className="admin-panel">
          <header className="admin-panel-header">
            <div>
              <h2 className="admin-panel-title">Recent jobs</h2>
              <p className="admin-panel-subtitle">
                {recentJobs.length} latest
                {recentJobs.length === 1 ? " posting" : " postings"}
              </p>
            </div>
            <Link href="/admin/jobs" className="admin-panel-link">
              View all
            </Link>
          </header>
          <RecentJobsTable jobs={recentJobs} />
        </article>
      </section>
    </>
  );
}
