import { prisma } from "@/lib/db/prisma";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // Monday start
  d.setDate(d.getDate() - diff);
  return d;
}

export type DashboardStats = {
  totalJobs: number;
  activeJobs: number;
  inactiveJobs: number;
  totalApplications: number;
  applicationsToday: number;
  applicationsThisWeek: number;
  totalEmployees: number;
  openPositions: number;
};

export type RecentApplicationRow = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  jobTitle: string;
  jobDepartment: string;
};

export type RecentJobRow = {
  id: string;
  title: string;
  department: string;
  location: string;
  isActive: boolean;
  createdAt: Date;
};

export class DashboardRepository {
  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      applicationsToday,
      applicationsThisWeek,
      totalEmployees,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.application.count(),
      prisma.application.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.application.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.employee.count(),
    ]);

    return {
      totalJobs,
      activeJobs,
      inactiveJobs: Math.max(0, totalJobs - activeJobs),
      totalApplications,
      applicationsToday,
      applicationsThisWeek,
      totalEmployees,
      openPositions: activeJobs,
    };
  }

  async findRecentApplications(limit = 10): Promise<RecentApplicationRow[]> {
    const rows = await prisma.application.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        job: {
          select: {
            title: true,
            department: true,
          },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      createdAt: row.createdAt,
      jobTitle: row.job.title,
      jobDepartment: row.job.department,
    }));
  }

  async findRecentJobs(limit = 8): Promise<RecentJobRow[]> {
    const rows = await prisma.job.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        isActive: true,
        createdAt: true,
      },
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      department: row.department,
      location: row.location,
      isActive: row.isActive !== false,
      createdAt: row.createdAt,
    }));
  }
}

export const dashboardRepository = new DashboardRepository();
