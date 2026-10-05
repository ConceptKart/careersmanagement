import type { CompanyDocument, CompanyDocumentType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { generateId } from "@/lib/utils/id";
import type { AdminCompanyDocListFilters } from "@/validators/admin-company-document.schema";
import { ADMIN_COMPANY_DOC_PAGE_SIZE } from "@/validators/admin-company-document.schema";

export type AdminCompanyDocListItem = {
  id: string;
  documentType: CompanyDocumentType;
  title: string;
  description: string | null;
  filePath: string | null;
  version: string | null;
  effectiveDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminCompanyDocListResult = {
  documents: AdminCompanyDocListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CreateCompanyDocInput = {
  documentType: CompanyDocumentType;
  title: string;
  description?: string | null;
  filePath?: string | null;
  version?: string | null;
  effectiveDate?: Date | null;
  uploadedBy?: string | null;
};

function mapDoc(row: CompanyDocument): AdminCompanyDocListItem {
  return {
    id: row.id,
    documentType: row.documentType,
    title: row.title,
    description: row.description,
    filePath: row.filePath,
    version: row.version,
    effectiveDate: row.effectiveDate,
    isActive: row.isActive ?? true,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class CompanyDocumentsRepository {
  private buildWhere(
    filters: AdminCompanyDocListFilters,
  ): Prisma.CompanyDocumentWhereInput {
    const where: Prisma.CompanyDocumentWhereInput = {};
    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q } },
        { description: { contains: filters.q } },
        { version: { contains: filters.q } },
      ];
    }
    if (filters.type !== "all") where.documentType = filters.type;
    if (filters.status === "active") where.isActive = true;
    if (filters.status === "inactive") where.isActive = false;
    return where;
  }

  async findAdminList(
    filters: AdminCompanyDocListFilters,
  ): Promise<AdminCompanyDocListResult> {
    const where = this.buildWhere(filters);
    const pageSize = ADMIN_COMPANY_DOC_PAGE_SIZE;
    const skip = (filters.page - 1) * pageSize;

    const [total, rows] = await Promise.all([
      prisma.companyDocument.count({ where }),
      prisma.companyDocument.findMany({
        where,
        orderBy: [{ documentType: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
    ]);

    return {
      documents: rows.map(mapDoc),
      total,
      page: filters.page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findById(id: string): Promise<AdminCompanyDocListItem | null> {
    const row = await prisma.companyDocument.findUnique({ where: { id } });
    return row ? mapDoc(row) : null;
  }

  async create(input: CreateCompanyDocInput): Promise<CompanyDocument> {
    return prisma.companyDocument.create({
      data: {
        id: generateId(),
        documentType: input.documentType,
        title: input.title,
        description: input.description ?? null,
        filePath: input.filePath ?? null,
        version: input.version ?? null,
        effectiveDate: input.effectiveDate ?? null,
        uploadedBy: input.uploadedBy ?? null,
        isActive: true,
      },
    });
  }

  async toggleActive(id: string): Promise<CompanyDocument | null> {
    const existing = await prisma.companyDocument.findUnique({ where: { id } });
    if (!existing) return null;
    return prisma.companyDocument.update({
      where: { id },
      data: { isActive: !(existing.isActive ?? true) },
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.companyDocument.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export const companyDocumentsRepository = new CompanyDocumentsRepository();
