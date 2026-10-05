import type { Feedback, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { AdminFeedbackListFilters } from "@/validators/admin-feedback.schema";
import { ADMIN_FEEDBACK_PAGE_SIZE } from "@/validators/admin-feedback.schema";

export type AdminFeedbackListItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string | null;
  subject: string;
  message: string;
  category: string | null;
  isResolved: boolean;
  hrResponse: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminFeedbackListResult = {
  feedback: AdminFeedbackListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export class FeedbackRepository {
  private buildWhere(
    filters: AdminFeedbackListFilters,
  ): Prisma.FeedbackWhereInput {
    const where: Prisma.FeedbackWhereInput = {};
    if (filters.status === "open") where.isResolved = false;
    if (filters.status === "resolved") where.isResolved = true;
    if (filters.q) {
      where.OR = [
        { subject: { contains: filters.q } },
        { message: { contains: filters.q } },
        { category: { contains: filters.q } },
        { employee: { fullName: { contains: filters.q } } },
        { employee: { email: { contains: filters.q } } },
      ];
    }
    return where;
  }

  async findAdminList(
    filters: AdminFeedbackListFilters,
  ): Promise<AdminFeedbackListResult> {
    const where = this.buildWhere(filters);
    const pageSize = ADMIN_FEEDBACK_PAGE_SIZE;
    const skip = (filters.page - 1) * pageSize;

    const [total, rows] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        include: {
          employee: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      feedback: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeName: row.employee.fullName,
        employeeEmail: row.employee.email,
        subject: row.subject,
        message: row.message,
        category: row.category,
        isResolved: row.isResolved ?? false,
        hrResponse: row.hrResponse,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      total,
      page: filters.page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async respond(id: string, hrResponse: string): Promise<Feedback | null> {
    try {
      return await prisma.feedback.update({
        where: { id },
        data: {
          hrResponse: hrResponse || null,
          isResolved: true,
        },
      });
    } catch {
      return null;
    }
  }
}

export const feedbackRepository = new FeedbackRepository();
