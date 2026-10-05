import type { Prisma, SalaryRecord } from "@prisma/client";
import { Prisma as PrismaNS } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { generateId } from "@/lib/utils/id";
import type { AdminSalaryListFilters } from "@/validators/admin-salary.schema";
import { ADMIN_SALARY_PAGE_SIZE } from "@/validators/admin-salary.schema";

export type AdminSalaryListItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basicSalary: string;
  hra: string | null;
  allowances: string | null;
  deductions: string | null;
  netSalary: string;
  paidOn: Date | null;
  createdAt: Date;
};

export type AdminSalaryListResult = {
  records: AdminSalaryListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CreateSalaryInput = {
  employeeId: string;
  month: string;
  basicSalary: PrismaNS.Decimal;
  hra: PrismaNS.Decimal;
  allowances: PrismaNS.Decimal;
  deductions: PrismaNS.Decimal;
  netSalary: PrismaNS.Decimal;
  paidOn?: Date | null;
};

function mapRecord(
  row: SalaryRecord & { employee: { fullName: string } },
): AdminSalaryListItem {
  return {
    id: row.id,
    employeeId: row.employeeId,
    employeeName: row.employee.fullName,
    month: row.month,
    basicSalary: row.basicSalary.toString(),
    hra: row.hra?.toString() ?? null,
    allowances: row.allowances?.toString() ?? null,
    deductions: row.deductions?.toString() ?? null,
    netSalary: row.netSalary.toString(),
    paidOn: row.paidOn,
    createdAt: row.createdAt,
  };
}

export class SalaryRecordsRepository {
  private buildWhere(
    filters: AdminSalaryListFilters,
  ): Prisma.SalaryRecordWhereInput {
    const where: Prisma.SalaryRecordWhereInput = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.month) where.month = filters.month;
    if (filters.q) {
      where.OR = [
        { month: { contains: filters.q } },
        { employee: { fullName: { contains: filters.q } } },
        { employee: { email: { contains: filters.q } } },
      ];
    }
    return where;
  }

  async findAdminList(
    filters: AdminSalaryListFilters,
  ): Promise<AdminSalaryListResult> {
    const where = this.buildWhere(filters);
    const pageSize = ADMIN_SALARY_PAGE_SIZE;
    const skip = (filters.page - 1) * pageSize;

    const [total, rows] = await Promise.all([
      prisma.salaryRecord.count({ where }),
      prisma.salaryRecord.findMany({
        where,
        include: { employee: { select: { fullName: true } } },
        orderBy: [{ month: "desc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
    ]);

    return {
      records: rows.map(mapRecord),
      total,
      page: filters.page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findById(id: string): Promise<AdminSalaryListItem | null> {
    const row = await prisma.salaryRecord.findUnique({
      where: { id },
      include: { employee: { select: { fullName: true } } },
    });
    return row ? mapRecord(row) : null;
  }

  async findByEmployeeMonth(
    employeeId: string,
    month: string,
  ): Promise<SalaryRecord | null> {
    return prisma.salaryRecord.findUnique({
      where: { employeeId_month: { employeeId, month } },
    });
  }

  async create(input: CreateSalaryInput): Promise<SalaryRecord> {
    return prisma.salaryRecord.create({
      data: {
        id: generateId(),
        employeeId: input.employeeId,
        month: input.month,
        basicSalary: input.basicSalary,
        hra: input.hra,
        allowances: input.allowances,
        deductions: input.deductions,
        netSalary: input.netSalary,
        paidOn: input.paidOn ?? null,
      },
    });
  }

  async update(id: string, input: CreateSalaryInput): Promise<SalaryRecord> {
    return prisma.salaryRecord.update({
      where: { id },
      data: {
        employeeId: input.employeeId,
        month: input.month,
        basicSalary: input.basicSalary,
        hra: input.hra,
        allowances: input.allowances,
        deductions: input.deductions,
        netSalary: input.netSalary,
        paidOn: input.paidOn ?? null,
      },
    });
  }
}

export const salaryRecordsRepository = new SalaryRecordsRepository();
