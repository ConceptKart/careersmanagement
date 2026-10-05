import type { Job, JobType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils/id";
import type { JobListFilters } from "@/validators/application.schema";
import type {
  AdminJobFormValues,
  AdminJobListFilters,
} from "@/validators/admin-job.schema";
import {
  ADMIN_JOB_PAGE_SIZE,
  keywordsToJson,
  toPrismaJobType,
} from "@/validators/admin-job.schema";

export type PublicJob = Pick<
  Job,
  | "id"
  | "title"
  | "department"
  | "location"
  | "jobType"
  | "description"
  | "requirements"
  | "keyResponsibilities"
  | "salaryOffered"
  | "isActive"
  | "createdAt"
>;

export type JobDetail = PublicJob & Pick<Job, "screeningKeywords" | "updatedAt">;

export type RelatedJob = Pick<
  Job,
  "id" | "title" | "department" | "location" | "jobType" | "createdAt"
>;

export type AdminJobListItem = {
  id: string;
  title: string;
  department: string;
  location: string;
  jobType: JobType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  applicationsCount: number;
};

export type AdminJobListResult = {
  jobs: AdminJobListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const publicJobSelect = {
  id: true,
  title: true,
  department: true,
  location: true,
  jobType: true,
  description: true,
  requirements: true,
  keyResponsibilities: true,
  salaryOffered: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.JobSelect;

const jobDetailSelect = {
  ...publicJobSelect,
  screeningKeywords: true,
  updatedAt: true,
} satisfies Prisma.JobSelect;

/**
 * PHP reference (jobs.php):
 * - Only is_active = 1
 * - Order by created_at DESC
 * - Filters: q (title search in Phase 1B), dept exact, loc exact
 */
export class JobsRepository {
  async findActive(filters: JobListFilters): Promise<PublicJob[]> {
    const where: Prisma.JobWhereInput = { isActive: true };

    if (filters.q) {
      where.title = { contains: filters.q };
    }
    if (filters.dept) where.department = filters.dept;
    if (filters.loc) where.location = filters.loc;
    if (filters.type) {
      const typeMap: Record<string, JobType> = {
        "full-time": "full_time",
        "part-time": "part_time",
        full_time: "full_time",
        part_time: "part_time",
        contract: "contract",
        internship: "internship",
      };
      const mapped = typeMap[filters.type];
      if (mapped) where.jobType = mapped;
    }

    return prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: publicJobSelect,
    });
  }

  async findActiveDepartments(): Promise<string[]> {
    const rows = await prisma.job.findMany({
      where: { isActive: true },
      distinct: ["department"],
      select: { department: true },
      orderBy: { department: "asc" },
    });
    return rows.map((r) => r.department);
  }

  async findActiveLocations(): Promise<string[]> {
    const rows = await prisma.job.findMany({
      where: { isActive: true },
      distinct: ["location"],
      select: { location: true },
      orderBy: { location: "asc" },
    });
    return rows.map((r) => r.location);
  }

  async findAllDepartments(): Promise<string[]> {
    const rows = await prisma.job.findMany({
      distinct: ["department"],
      select: { department: true },
      orderBy: { department: "asc" },
    });
    return rows.map((r) => r.department);
  }

  async findAllLocations(): Promise<string[]> {
    const rows = await prisma.job.findMany({
      distinct: ["location"],
      select: { location: true },
      orderBy: { location: "asc" },
    });
    return rows.map((r) => r.location);
  }

  async findById(id: string): Promise<PublicJob | null> {
    return prisma.job.findUnique({
      where: { id },
      select: publicJobSelect,
    });
  }

  async findDetailById(id: string): Promise<JobDetail | null> {
    return prisma.job.findUnique({
      where: { id },
      select: jobDetailSelect,
    });
  }

  async findActiveById(id: string): Promise<PublicJob | null> {
    return prisma.job.findFirst({
      where: { id, isActive: true },
      select: publicJobSelect,
    });
  }

  async findRelated(
    jobId: string,
    department: string,
    limit = 3,
  ): Promise<RelatedJob[]> {
    return prisma.job.findMany({
      where: {
        isActive: true,
        department,
        id: { not: jobId },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        jobType: true,
        createdAt: true,
      },
    });
  }

  private buildAdminWhere(filters: AdminJobListFilters): Prisma.JobWhereInput {
    const where: Prisma.JobWhereInput = {};
    if (filters.q) where.title = { contains: filters.q };
    if (filters.dept) where.department = filters.dept;
    if (filters.loc) where.location = filters.loc;
    if (filters.status === "active") where.isActive = true;
    if (filters.status === "inactive") {
      where.OR = [{ isActive: false }, { isActive: null }];
    }
    return where;
  }

  async findAdminList(filters: AdminJobListFilters): Promise<AdminJobListResult> {
    const where = this.buildAdminWhere(filters);
    const page = filters.page || 1;
    const pageSize = ADMIN_JOB_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const [total, rows] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          department: true,
          location: true,
          jobType: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { applications: true } },
        },
      }),
    ]);

    return {
      jobs: rows.map((row) => ({
        id: row.id,
        title: row.title,
        department: row.department,
        location: row.location,
        jobType: row.jobType,
        isActive: row.isActive !== false,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        applicationsCount: row._count.applications,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async countApplications(jobId: string): Promise<number> {
    return prisma.application.count({ where: { jobId } });
  }

  async create(data: AdminJobFormValues): Promise<JobDetail> {
    const id = generateId();
    return prisma.job.create({
      data: {
        id,
        title: data.title,
        department: data.department,
        location: data.location,
        jobType: toPrismaJobType(data.jobType),
        description: data.description,
        requirements: data.requirements,
        keyResponsibilities: data.keyResponsibilities?.trim() || null,
        salaryOffered: data.salaryOffered?.trim() || null,
        screeningKeywords: keywordsToJson(data.screeningKeywords),
        isActive: data.isActive,
      },
      select: jobDetailSelect,
    });
  }

  async update(id: string, data: AdminJobFormValues): Promise<JobDetail> {
    return prisma.job.update({
      where: { id },
      data: {
        title: data.title,
        department: data.department,
        location: data.location,
        jobType: toPrismaJobType(data.jobType),
        description: data.description,
        requirements: data.requirements,
        keyResponsibilities: data.keyResponsibilities?.trim() || null,
        salaryOffered: data.salaryOffered?.trim() || null,
        screeningKeywords: keywordsToJson(data.screeningKeywords),
        isActive: data.isActive,
      },
      select: jobDetailSelect,
    });
  }

  async setActive(id: string, isActive: boolean): Promise<JobDetail> {
    return prisma.job.update({
      where: { id },
      data: { isActive },
      select: jobDetailSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.job.delete({ where: { id } });
  }

  async duplicate(sourceId: string): Promise<JobDetail | null> {
    const source = await prisma.job.findUnique({ where: { id: sourceId } });
    if (!source) return null;

    const id = generateId();
    return prisma.job.create({
      data: {
        id,
        title: `${source.title} (Copy)`,
        department: source.department,
        location: source.location,
        jobType: source.jobType,
        description: source.description,
        requirements: source.requirements,
        keyResponsibilities: source.keyResponsibilities,
        salaryOffered: source.salaryOffered,
        screeningKeywords: source.screeningKeywords,
        isActive: false,
      },
      select: jobDetailSelect,
    });
  }
}

export const jobsRepository = new JobsRepository();
