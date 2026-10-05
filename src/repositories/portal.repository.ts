import type {
  Achievement,
  CompanyDocument,
  Employee,
  EmployeeDocument,
  Feedback,
  SalaryRecord,
} from "@prisma/client";
import { Prisma as PrismaNS } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { generateId } from "@/lib/utils/id";

function decimalToString(
  value: PrismaNS.Decimal | null | undefined,
): string | null {
  if (value == null) return null;
  return value.toString();
}

export type PortalEmployeeProfile = {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  position: string;
  department: string;
  employmentType: Employee["employmentType"];
  dateOfJoining: Date;
  dateOfExit: Date | null;
  salary: string | null;
  status: Employee["status"];
  manager: { id: string; fullName: string } | null;
  linkedUser: { id: string; email: string } | null;
};

export type PortalDocument = {
  id: string;
  title: string;
  documentType: EmployeeDocument["documentType"];
  period: string | null;
  filePath: string | null;
  createdAt: Date;
};

export type PortalSalaryRecord = {
  id: string;
  month: string;
  basicSalary: string;
  hra: string | null;
  allowances: string | null;
  deductions: string | null;
  netSalary: string;
  paidOn: Date | null;
};

export type PortalAchievement = {
  id: string;
  title: string;
  description: string | null;
  achievedOn: Date;
};

export type PortalFeedbackItem = {
  id: string;
  subject: string;
  message: string;
  category: string | null;
  isResolved: boolean;
  hrResponse: string | null;
  createdAt: Date;
};

export type PortalCompanyDocument = {
  id: string;
  documentType: CompanyDocument["documentType"];
  title: string;
  description: string | null;
  filePath: string | null;
  version: string | null;
};

function mapProfile(
  row: Employee & {
    manager: { id: string; fullName: string } | null;
    user: { id: string; email: string } | null;
  },
): PortalEmployeeProfile {
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
    status: row.status,
    manager: row.manager,
    linkedUser: row.user,
  };
}

export class PortalRepository {
  async findEmployeeByUserId(
    userId: string,
  ): Promise<PortalEmployeeProfile | null> {
    const row = await prisma.employee.findFirst({
      where: { userId },
      include: {
        manager: { select: { id: true, fullName: true } },
        user: { select: { id: true, email: true } },
      },
    });
    return row ? mapProfile(row) : null;
  }

  async findDocuments(employeeId: string): Promise<PortalDocument[]> {
    const rows = await prisma.employeeDocument.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      documentType: row.documentType,
      period: row.period,
      filePath: row.filePath,
      createdAt: row.createdAt,
    }));
  }

  async findDocumentOwnedByEmployee(
    employeeId: string,
    filePath: string,
  ): Promise<EmployeeDocument | null> {
    return prisma.employeeDocument.findFirst({
      where: { employeeId, filePath },
    });
  }

  async findSalaryHistory(employeeId: string): Promise<PortalSalaryRecord[]> {
    const rows = await prisma.salaryRecord.findMany({
      where: { employeeId },
      orderBy: { month: "desc" },
      take: 12,
    });
    return rows.map((row: SalaryRecord) => ({
      id: row.id,
      month: row.month,
      basicSalary: row.basicSalary.toString(),
      hra: decimalToString(row.hra),
      allowances: decimalToString(row.allowances),
      deductions: decimalToString(row.deductions),
      netSalary: row.netSalary.toString(),
      paidOn: row.paidOn,
    }));
  }

  async findAchievements(employeeId: string): Promise<PortalAchievement[]> {
    const rows = await prisma.achievement.findMany({
      where: { employeeId },
      orderBy: { achievedOn: "desc" },
    });
    return rows.map((row: Achievement) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      achievedOn: row.achievedOn,
    }));
  }

  async findFeedback(employeeId: string): Promise<PortalFeedbackItem[]> {
    const rows = await prisma.feedback.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row: Feedback) => ({
      id: row.id,
      subject: row.subject,
      message: row.message,
      category: row.category,
      isResolved: row.isResolved ?? false,
      hrResponse: row.hrResponse,
      createdAt: row.createdAt,
    }));
  }

  async createFeedback(input: {
    employeeId: string;
    subject: string;
    message: string;
    category?: string | null;
  }): Promise<Feedback> {
    return prisma.feedback.create({
      data: {
        id: generateId(),
        employeeId: input.employeeId,
        subject: input.subject,
        message: input.message,
        category: input.category ?? null,
      },
    });
  }

  async findActiveCompanyDocuments(): Promise<PortalCompanyDocument[]> {
    const rows = await prisma.companyDocument.findMany({
      where: { isActive: true },
      orderBy: [{ documentType: "asc" }, { title: "asc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      documentType: row.documentType,
      title: row.title,
      description: row.description,
      filePath: row.filePath,
      version: row.version,
    }));
  }

  async findActiveCompanyDocumentByPath(
    filePath: string,
  ): Promise<CompanyDocument | null> {
    return prisma.companyDocument.findFirst({
      where: { filePath, isActive: true },
    });
  }
}

export const portalRepository = new PortalRepository();
