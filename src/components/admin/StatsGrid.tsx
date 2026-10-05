import { DashboardCard } from "@/components/admin/DashboardCard";
import {
  ApplicationsIcon,
  EmployeesIcon,
  JobsIcon,
} from "@/components/admin/icons";
import type { DashboardStats } from "@/repositories/dashboard.repository";

type Props = {
  stats: DashboardStats;
};

export function StatsGrid({ stats }: Props) {
  return (
    <div className="admin-stats-grid">
      <DashboardCard label="Total Jobs" value={stats.totalJobs} icon={<JobsIcon size={16} />} />
      <DashboardCard label="Active Jobs" value={stats.activeJobs} icon={<JobsIcon size={16} />} />
      <DashboardCard
        label="Inactive Jobs"
        value={stats.inactiveJobs}
        icon={<JobsIcon size={16} />}
      />
      <DashboardCard
        label="Open Positions"
        value={stats.openPositions}
        icon={<JobsIcon size={16} />}
      />
      <DashboardCard
        label="Total Applications"
        value={stats.totalApplications}
        icon={<ApplicationsIcon size={16} />}
      />
      <DashboardCard
        label="Applications Today"
        value={stats.applicationsToday}
        icon={<ApplicationsIcon size={16} />}
      />
      <DashboardCard
        label="Applications This Week"
        value={stats.applicationsThisWeek}
        icon={<ApplicationsIcon size={16} />}
      />
      <DashboardCard
        label="Total Employees"
        value={stats.totalEmployees}
        icon={<EmployeesIcon size={16} />}
      />
    </div>
  );
}
