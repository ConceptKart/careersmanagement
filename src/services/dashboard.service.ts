import {
  dashboardRepository,
  type DashboardStats,
  type RecentApplicationRow,
  type RecentJobRow,
} from "@/repositories/dashboard.repository";

export type DashboardData = {
  stats: DashboardStats;
  recentApplications: RecentApplicationRow[];
  recentJobs: RecentJobRow[];
};

/**
 * Admin dashboard aggregates — parallel Prisma reads, no CRUD.
 */
export class DashboardService {
  async getDashboard(): Promise<DashboardData> {
    const [stats, recentApplications, recentJobs] = await Promise.all([
      dashboardRepository.getStats(),
      dashboardRepository.findRecentApplications(10),
      dashboardRepository.findRecentJobs(8),
    ]);

    return { stats, recentApplications, recentJobs };
  }
}

export const dashboardService = new DashboardService();
