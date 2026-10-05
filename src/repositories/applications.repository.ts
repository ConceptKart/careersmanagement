import type {
  Application,
  ApplicationStatus,
  Prisma,
  ScreeningPriority,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { generateId } from "@/lib/utils/id";
import type { AdminApplicationListFilters } from "@/validators/admin-application.schema";
import { ADMIN_APPLICATION_PAGE_SIZE } from "@/validators/admin-application.schema";

export type ApplicationStatusRow = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: ApplicationStatus;
  jobTitle: string;
};

export type ApplicationStatusDetail = {
  id: string;
  name: string;
  email: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  screeningSummary: string | null;
  job: {
    title: string;
    department: string;
    location: string;
  };
};

export type CreateApplicationInput = {
  jobId: string;
  name: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  coverLetter?: string;
  resumePath: string;
};

export type AdminApplicationListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  status: ApplicationStatus;
  screeningScore: number | null;
  screeningPriority: ScreeningPriority | null;
  createdAt: Date;
  jobId: string;
  jobTitle: string;
};

export type AdminApplicationListResult = {
  applications: AdminApplicationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminApplicationDetail = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  linkedinUrl: string | null;
  coverLetter: string | null;
  resumePath: string | null;
  status: ApplicationStatus;
  adminNotes: string | null;
  screeningScore: number | null;
  screeningPriority: ScreeningPriority | null;
  screeningSummary: string | null;
  screeningMatchedKeywords: string | null;
  screeningMissingKeywords: string | null;
  screeningScoredAt: Date | null;
  screeningError: string | null;
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
  };
};

function parseOptionalDate(value: string | undefined, endOfDay = false): Date | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d;
}

export class ApplicationsRepository {
  async create(input: CreateApplicationInput): Promise<Application> {
    return prisma.application.create({
      data: {
        id: generateId(),
        jobId: input.jobId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        linkedinUrl: input.linkedinUrl ?? null,
        coverLetter: input.coverLetter ?? null,
        resumePath: input.resumePath,
        status: "new",
      },
    });
  }

  async findByJobAndEmail(jobId: string, email: string): Promise<Application | null> {
    return prisma.application.findFirst({
      where: { jobId, email },
    });
  }

  async findStatusByIdAndEmail(
    applicationId: string,
    email: string,
  ): Promise<ApplicationStatusDetail | null> {
    const row = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        screeningSummary: true,
        job: {
          select: {
            title: true,
            department: true,
            location: true,
          },
        },
      },
    });

    if (!row?.email) return null;
    if (row.email.trim().toLowerCase() !== email.trim().toLowerCase()) return null;

    return {
      ...row,
      email: row.email,
    };
  }

  async findStatusByEmail(email: string): Promise<ApplicationStatusRow[]> {
    const rows = await prisma.application.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        job: { select: { title: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      status: r.status,
      jobTitle: r.job.title,
    }));
  }

  private buildAdminWhere(
    filters: AdminApplicationListFilters,
  ): Prisma.ApplicationWhereInput {
    const where: Prisma.ApplicationWhereInput = {};

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q } },
        { email: { contains: filters.q } },
        { phone: { contains: filters.q } },
      ];
    }
    if (filters.job) where.jobId = filters.job;
    if (filters.status && filters.status !== "all") {
      where.status = filters.status;
    }
    if (filters.priority && filters.priority !== "all") {
      where.screeningPriority = filters.priority;
    }

    const from = parseOptionalDate(filters.dateFrom, false);
    const to = parseOptionalDate(filters.dateTo, true);
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    return where;
  }

  async findAdminList(
    filters: AdminApplicationListFilters,
  ): Promise<AdminApplicationListResult> {
    const where = this.buildAdminWhere(filters);
    const page = filters.page || 1;
    const pageSize = ADMIN_APPLICATION_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const orderBy: Prisma.ApplicationOrderByWithRelationInput[] =
      filters.sort === "score"
        ? [{ screeningScore: "desc" }, { createdAt: "desc" }]
        : [{ createdAt: "desc" }];

    const [total, rows] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          screeningScore: true,
          screeningPriority: true,
          createdAt: true,
          jobId: true,
          job: { select: { title: true } },
        },
      }),
    ]);

    return {
      applications: rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        status: row.status,
        screeningScore: row.screeningScore,
        screeningPriority: row.screeningPriority,
        createdAt: row.createdAt,
        jobId: row.jobId,
        jobTitle: row.job.title,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findAdminDetail(id: string): Promise<AdminApplicationDetail | null> {
    return prisma.application.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        linkedinUrl: true,
        coverLetter: true,
        resumePath: true,
        status: true,
        adminNotes: true,
        screeningScore: true,
        screeningPriority: true,
        screeningSummary: true,
        screeningMatchedKeywords: true,
        screeningMissingKeywords: true,
        screeningScoredAt: true,
        screeningError: true,
        createdAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: ApplicationStatus) {
    return prisma.application.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
  }

  async updateAdminNotes(id: string, adminNotes: string | null) {
    return prisma.application.update({
      where: { id },
      data: { adminNotes },
      select: { id: true, adminNotes: true },
    });
  }

  async findJobOptions(): Promise<Array<{ id: string; title: string }>> {
    return prisma.job.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
  }
}

export const applicationsRepository = new ApplicationsRepository();
