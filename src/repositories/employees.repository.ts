import type {
  Employee,
  EmployeeDocument,
  EmployeeDocumentType,
  EmployeeStatus,
  EmploymentType,
  Prisma,
  SalaryRecord,
} from "@prisma/client";
import { Prisma as PrismaNS } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { generateId } from "@/lib/utils/id";
import type { AdminEmployeeListFilters } from "@/validators/admin-employee.schema";
import { ADMIN_EMPLOYEE_PAGE_SIZE } from "@/validators/admin-employee.schema";

export type AdminEmployeeListItem = {
  id: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  employmentType: EmploymentType;
  dateOfJoining: Date;
  salary: string | null;
  status: EmployeeStatus;
  createdAt: Date;
};

export type AdminEmployeeListResult = {
  employees: AdminEmployeeListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ManagerOption = { id: string; fullName: string };

export type AdminEmployeeDocument = {
  id: string;
  documentType: EmployeeDocumentType;
  title: string;
  description: string | null;
  filePath: string | null;
  amount: string | null;
  period: string | null;
  effectiveDate: Date | null;
  createdAt: Date;
};

export type AdminSalaryRecord = {
  id: string;
  month: string;
  basicSalary: string;
  hra: string | null;
  allowances: string | null;
  deductions: string | null;
  netSalary: string;
  paidOn: Date | null;
  createdAt: Date;
};

export type AdminEmployeeDetail = {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  position: string;
  department: string;
  employmentType: EmploymentType;
  dateOfJoining: Date;
  dateOfExit: Date | null;
  salary: string | null;
  managerId: string | null;
  status: EmployeeStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  manager: { id: string; fullName: string } | null;
  linkedUser: { id: string; email: string } | null;
  documents: AdminEmployeeDocument[];
  salaryRecords: AdminSalaryRecord[];
};

export type CreateEmployeeInput = {
  fullName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  employmentType: EmploymentType;
  dateOfJoining: Date;
  salary?: PrismaNS.Decimal | null;
  managerId?: string | null;
  status: EmployeeStatus;
  notes?: string | null;
};

export type UpdateEmployeeInput = {
  fullName: string;
  phone?: string | null;
  position: string;
  department: string;
  employmentType: EmploymentType;
  dateOfJoining: Date;
  dateOfExit?: Date | null;
  salary?: PrismaNS.Decimal | null;
  managerId?: string | null;
  status: EmployeeStatus;
  notes?: string | null;
};

export type CreateDocumentInput = {
  employeeId: string;
  documentType: EmployeeDocumentType;
  title: string;
  description?: string | null;
  filePath?: string | null;
  amount?: PrismaNS.Decimal | null;
  period?: string | null;
  effectiveDate?: Date | null;
  uploadedBy?: string | null;
};

function decimalToString(
  value: PrismaNS.Decimal | null | undefined,
): string | null {
  if (value == null) return null;
  return value.toString();
}

function mapListItem(row: Employee): AdminEmployeeListItem {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    department: row.department,
    position: row.position,
    employmentType: row.employmentType,
    dateOfJoining: row.dateOfJoining,
    salary: decimalToString(row.salary),
    status: row.status,
    createdAt: row.createdAt,
  };
}

function mapDocument(doc: EmployeeDocument): AdminEmployeeDocument {
  return {
    id: doc.id,
    documentType: doc.documentType,
    title: doc.title,
    description: doc.description,
    filePath: doc.filePath,
    amount: decimalToString(doc.amount),
    period: doc.period,
    effectiveDate: doc.effectiveDate,
    createdAt: doc.createdAt,
  };
}

function mapSalary(row: SalaryRecord): AdminSalaryRecord {
  return {
    id: row.id,
    month: row.month,
    basicSalary: row.basicSalary.toString(),
    hra: decimalToString(row.hra),
    allowances: decimalToString(row.allowances),
    deductions: decimalToString(row.deductions),
    netSalary: row.netSalary.toString(),
    paidOn: row.paidOn,
    createdAt: row.createdAt,
  };
}

export class EmployeesRepository {
  private buildWhere(filters: AdminEmployeeListFilters): Prisma.EmployeeWhereInput {
    const where: Prisma.EmployeeWhereInput = {};

    if (filters.q) {
      where.OR = [
        { fullName: { contains: filters.q } },
        { email: { contains: filters.q } },
        { department: { contains: filters.q } },
        { position: { contains: filters.q } },
      ];
    }

    if (filters.department) {
      where.department = filters.department;
    }

    if (filters.status !== "all") {
      where.status = filters.status;
    }

    return where;
  }

  private buildOrderBy(
    sort: AdminEmployeeListFilters["sort"],
  ): Prisma.EmployeeOrderByWithRelationInput {
    switch (sort) {
      case "name":
        return { fullName: "asc" };
      case "department":
        return { department: "asc" };
      case "joining":
        return { dateOfJoining: "desc" };
      case "recent":
      default:
        return { createdAt: "desc" };
    }
  }

  async findAdminList(
    filters: AdminEmployeeListFilters,
  ): Promise<AdminEmployeeListResult> {
    const where = this.buildWhere(filters);
    const pageSize = ADMIN_EMPLOYEE_PAGE_SIZE;
    const page = filters.page;
    const skip = (page - 1) * pageSize;

    const [total, rows] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        orderBy: this.buildOrderBy(filters.sort),
        skip,
        take: pageSize,
      }),
    ]);

    return {
      employees: rows.map(mapListItem),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findById(id: string): Promise<AdminEmployeeDetail | null> {
    const row = await prisma.employee.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, fullName: true } },
        user: { select: { id: true, email: true } },
        documents: { orderBy: { createdAt: "desc" } },
        salaryRecords: { orderBy: { month: "desc" }, take: 24 },
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      userId: row.userId,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      position: row.position,
      department: row.department,
      employmentType: row.employmentType,
      dateOfJoining: row.dateOfJoining,
      dateOfExit: row.dateOfExit,
      salary: decimalToString(row.salary),
      managerId: row.managerId,
      status: row.status,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      manager: row.manager,
      linkedUser: row.user,
      documents: row.documents.map(mapDocument),
      salaryRecords: row.salaryRecords.map(mapSalary),
    };
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return prisma.employee.findFirst({
      where: { email },
    });
  }

  async listDepartments(): Promise<string[]> {
    const rows = await prisma.employee.findMany({
      select: { department: true },
      distinct: ["department"],
      orderBy: { department: "asc" },
    });
    return rows.map((r) => r.department).filter(Boolean);
  }

  async listActiveManagers(excludeId?: string): Promise<ManagerOption[]> {
    return prisma.employee.findMany({
      where: {
        status: "active",
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    });
  }

  async listEmployeeOptions(): Promise<ManagerOption[]> {
    return prisma.employee.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    });
  }

  async findAdminDocumentsList(filters: {
    q: string;
    employeeId: string;
    type: string;
    page: number;
    pageSize: number;
  }): Promise<{
    documents: Array<
      AdminEmployeeDocument & { employeeId: string; employeeName: string }
    >;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const where: Prisma.EmployeeDocumentWhereInput = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.type !== "all") {
      where.documentType = filters.type as EmployeeDocumentType;
    }
    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q } },
        { description: { contains: filters.q } },
        { period: { contains: filters.q } },
        { employee: { fullName: { contains: filters.q } } },
      ];
    }

    const skip = (filters.page - 1) * filters.pageSize;
    const [total, rows] = await Promise.all([
      prisma.employeeDocument.count({ where }),
      prisma.employeeDocument.findMany({
        where,
        include: { employee: { select: { fullName: true } } },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: filters.pageSize,
      }),
    ]);

    return {
      documents: rows.map((row) => ({
        ...mapDocument(row),
        employeeId: row.employeeId,
        employeeName: row.employee.fullName,
      })),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async deleteDocument(id: string): Promise<EmployeeDocument | null> {
    try {
      return await prisma.employeeDocument.delete({ where: { id } });
    } catch {
      return null;
    }
  }

  async findDocumentById(id: string): Promise<EmployeeDocument | null> {
    return prisma.employeeDocument.findUnique({ where: { id } });
  }

  async create(input: CreateEmployeeInput): Promise<Employee> {
    return prisma.employee.create({
      data: {
        id: generateId(),
        fullName: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        position: input.position,
        department: input.department,
        employmentType: input.employmentType,
        dateOfJoining: input.dateOfJoining,
        salary: input.salary ?? null,
        managerId: input.managerId ?? null,
        status: input.status,
        notes: input.notes ?? null,
      },
    });
  }

  async update(id: string, input: UpdateEmployeeInput): Promise<Employee> {
    return prisma.employee.update({
      where: { id },
      data: {
        fullName: input.fullName,
        phone: input.phone ?? null,
        position: input.position,
        department: input.department,
        employmentType: input.employmentType,
        dateOfJoining: input.dateOfJoining,
        dateOfExit: input.dateOfExit ?? null,
        salary: input.salary ?? null,
        managerId: input.managerId ?? null,
        status: input.status,
        notes: input.notes ?? null,
      },
    });
  }

  async createDocument(input: CreateDocumentInput): Promise<EmployeeDocument> {
    return prisma.employeeDocument.create({
      data: {
        id: generateId(),
        employeeId: input.employeeId,
        documentType: input.documentType,
        title: input.title,
        description: input.description ?? null,
        filePath: input.filePath ?? null,
        amount: input.amount ?? null,
        period: input.period ?? null,
        effectiveDate: input.effectiveDate ?? null,
        uploadedBy: input.uploadedBy ?? null,
      },
    });
  }

  async findDocuments(employeeId: string): Promise<AdminEmployeeDocument[]> {
    const rows = await prisma.employeeDocument.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapDocument);
  }

  async findSalaryHistory(employeeId: string): Promise<AdminSalaryRecord[]> {
    const rows = await prisma.salaryRecord.findMany({
      where: { employeeId },
      orderBy: { month: "desc" },
      take: 24,
    });
    return rows.map(mapSalary);
  }
}

export const employeesRepository = new EmployeesRepository();
