import type { Achievement, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { generateId } from "@/lib/utils/id";
import type { AdminAchievementListFilters } from "@/validators/admin-achievement.schema";
import { ADMIN_ACHIEVEMENT_PAGE_SIZE } from "@/validators/admin-achievement.schema";

export type AdminAchievementListItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string | null;
  achievedOn: Date;
  createdAt: Date;
};

export type AdminAchievementListResult = {
  achievements: AdminAchievementListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminAchievementDetail = AdminAchievementListItem;

export type CreateAchievementInput = {
  employeeId: string;
  title: string;
  description?: string | null;
  achievedOn: Date;
  createdBy?: string | null;
};

export type UpdateAchievementInput = {
  employeeId: string;
  title: string;
  description?: string | null;
  achievedOn: Date;
};

export class AchievementsRepository {
  private buildWhere(
    filters: AdminAchievementListFilters,
  ): Prisma.AchievementWhereInput {
    const where: Prisma.AchievementWhereInput = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q } },
        { description: { contains: filters.q } },
        { employee: { fullName: { contains: filters.q } } },
      ];
    }
    return where;
  }

  async findAdminList(
    filters: AdminAchievementListFilters,
  ): Promise<AdminAchievementListResult> {
    const where = this.buildWhere(filters);
    const pageSize = ADMIN_ACHIEVEMENT_PAGE_SIZE;
    const skip = (filters.page - 1) * pageSize;

    const [total, rows] = await Promise.all([
      prisma.achievement.count({ where }),
      prisma.achievement.findMany({
        where,
        include: { employee: { select: { fullName: true } } },
        orderBy: { achievedOn: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      achievements: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeName: row.employee.fullName,
        title: row.title,
        description: row.description,
        achievedOn: row.achievedOn,
        createdAt: row.createdAt,
      })),
      total,
      page: filters.page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findById(id: string): Promise<AdminAchievementDetail | null> {
    const row = await prisma.achievement.findUnique({
      where: { id },
      include: { employee: { select: { fullName: true } } },
    });
    if (!row) return null;
    return {
      id: row.id,
      employeeId: row.employeeId,
      employeeName: row.employee.fullName,
      title: row.title,
      description: row.description,
      achievedOn: row.achievedOn,
      createdAt: row.createdAt,
    };
  }

  async create(input: CreateAchievementInput): Promise<Achievement> {
    return prisma.achievement.create({
      data: {
        id: generateId(),
        employeeId: input.employeeId,
        title: input.title,
        description: input.description ?? null,
        achievedOn: input.achievedOn,
        createdBy: input.createdBy ?? null,
      },
    });
  }

  async update(id: string, input: UpdateAchievementInput): Promise<Achievement> {
    return prisma.achievement.update({
      where: { id },
      data: {
        employeeId: input.employeeId,
        title: input.title,
        description: input.description ?? null,
        achievedOn: input.achievedOn,
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.achievement.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export const achievementsRepository = new AchievementsRepository();
