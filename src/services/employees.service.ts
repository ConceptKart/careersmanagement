import { Prisma } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import { getStorage } from "@/lib/storage";
import { validateDocumentUpload } from "@/lib/uploads/document-file";
import { generateId } from "@/lib/utils/id";
import {
  employeesRepository,
  type AdminEmployeeDetail,
  type AdminEmployeeListResult,
  type ManagerOption,
} from "@/repositories/employees.repository";
import type {
  AdminEmployeeCreateValues,
  AdminEmployeeDocumentValues,
  AdminEmployeeListFilters,
  AdminEmployeeUpdateValues,
} from "@/validators/admin-employee.schema";
import {
  ADMIN_EMPLOYEE_DOC_PAGE_SIZE,
  type AdminEmployeeDocListFilters,
} from "@/validators/admin-salary.schema";

export class EmployeeError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string>,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "EmployeeError";
  }
}

export type DocumentFile = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
};

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toDecimal(value: string | undefined): Prisma.Decimal | null {
  if (!value) return null;
  return new Prisma.Decimal(value);
}

function sanitizeDocumentFilename(file: string): string | null {
  let normalized = file.replace(/%2F/gi, "/").replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalized.startsWith("documents/")) {
    normalized = normalized.slice("documents/".length);
  }
  if (!normalized || normalized.includes("..") || normalized.includes("/")) {
    return null;
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(normalized)) return null;
  return normalized;
}

/**
 * PHP reference: admin/employees/* + admin/documents/new.php
 */
export class EmployeesService {
  async getEmployees(
    filters: AdminEmployeeListFilters,
  ): Promise<AdminEmployeeListResult> {
    return employeesRepository.findAdminList(filters);
  }

  async getEmployee(id: string): Promise<AdminEmployeeDetail | null> {
    return employeesRepository.findById(id);
  }

  async listDepartments(): Promise<string[]> {
    return employeesRepository.listDepartments();
  }

  async listManagerOptions(excludeId?: string): Promise<ManagerOption[]> {
    return employeesRepository.listActiveManagers(excludeId);
  }

  async createEmployee(values: AdminEmployeeCreateValues) {
    const existing = await employeesRepository.findByEmail(values.email);
    if (existing) {
      throw new EmployeeError("An employee with this email already exists", {
        email: "An employee with this email already exists",
      });
    }

    if (values.managerId) {
      const manager = await employeesRepository.findById(values.managerId);
      if (!manager) {
        throw new EmployeeError("Selected manager was not found", {
          managerId: "Selected manager was not found",
        });
      }
    }

    return employeesRepository.create({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      position: values.position,
      department: values.department,
      employmentType: values.employmentType,
      dateOfJoining: parseDateOnly(values.dateOfJoining),
      salary: toDecimal(values.salary),
      managerId: values.managerId ?? null,
      status: values.status,
      notes: values.notes ?? null,
    });
  }

  async updateEmployee(id: string, values: AdminEmployeeUpdateValues) {
    const existing = await employeesRepository.findById(id);
    if (!existing) return null;

    if (values.managerId) {
      if (values.managerId === id) {
        throw new EmployeeError("An employee cannot be their own manager", {
          managerId: "An employee cannot be their own manager",
        });
      }
      const manager = await employeesRepository.findById(values.managerId);
      if (!manager) {
        throw new EmployeeError("Selected manager was not found", {
          managerId: "Selected manager was not found",
        });
      }
    }

    return employeesRepository.update(id, {
      fullName: values.fullName,
      phone: values.phone ?? null,
      position: values.position,
      department: values.department,
      employmentType: values.employmentType,
      dateOfJoining: parseDateOnly(values.dateOfJoining),
      dateOfExit: values.dateOfExit ? parseDateOnly(values.dateOfExit) : null,
      salary: toDecimal(values.salary),
      managerId: values.managerId ?? null,
      status: values.status,
      notes: values.notes ?? null,
    });
  }

  async getEmployeeDocuments(employeeId: string) {
    return employeesRepository.findDocuments(employeeId);
  }

  async getSalaryHistory(employeeId: string) {
    return employeesRepository.findSalaryHistory(employeeId);
  }

  async listEmployeeOptions() {
    return employeesRepository.listEmployeeOptions();
  }

  async getAdminDocuments(filters: AdminEmployeeDocListFilters) {
    return employeesRepository.findAdminDocumentsList({
      q: filters.q,
      employeeId: filters.employeeId,
      type: filters.type,
      page: filters.page,
      pageSize: ADMIN_EMPLOYEE_DOC_PAGE_SIZE,
    });
  }

  async deleteDocument(id: string) {
    const doc = await employeesRepository.findDocumentById(id);
    if (!doc) return null;
    // PHP has no delete; Phase 4F adds DB delete (file left on disk, like company docs).
    return employeesRepository.deleteDocument(id);
  }

  async addDocument(
    values: AdminEmployeeDocumentValues,
    file: DocumentFile | null,
    uploadedBy: string | null,
  ) {
    const employee = await employeesRepository.findById(values.employeeId);
    if (!employee) {
      throw new EmployeeError("Employee not found", undefined, 404);
    }

    let filePath: string | null = null;
    if (file && file.size > 0) {
      const validated = validateDocumentUpload(file);
      if (!validated.ok) {
        throw new EmployeeError("Invalid file", { file: validated.message });
      }

      const filename = `${generateId()}.${validated.ext}`;
      await getStorage().put({
        key: `documents/${filename}`,
        data: file.buffer,
        contentType: file.mimeType || "application/octet-stream",
      });
      // PHP stores basename only in employee_documents.file_path
      filePath = filename;
    }

    return employeesRepository.createDocument({
      employeeId: values.employeeId,
      documentType: values.documentType,
      title: values.title,
      description: values.description ?? null,
      filePath,
      amount: toDecimal(values.amount),
      period: values.period ?? null,
      effectiveDate: values.effectiveDate
        ? parseDateOnly(values.effectiveDate)
        : null,
      uploadedBy,
    });
  }

  /**
   * Resolve employee document for admin download.
   * DB stores basename; files live under uploads/documents/.
   */
  async downloadDocument(filePath: string): Promise<{
    buffer: Buffer;
    contentType: string;
    size: number;
    filename: string;
  } | null> {
    const safe = sanitizeDocumentFilename(filePath);
    if (!safe) return null;

    const key = `documents/${safe}`;
    const storage = getStorage();
    if (!storage.exists || !(await storage.exists(key))) {
      return null;
    }

    const ext = path.extname(safe).slice(1).toLowerCase();
    const mime: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
    };

    if (typeof storage.resolveLocalPath === "function") {
      const fullPath = storage.resolveLocalPath(key);
      if (!fullPath) return null;
      const buffer = await fs.readFile(fullPath);
      return {
        buffer,
        contentType: mime[ext] ?? "application/octet-stream",
        size: buffer.byteLength,
        filename: safe,
      };
    }

    const streamed = await storage.getStream(key);
    const chunks: Buffer[] = [];
    for await (const chunk of streamed.stream as AsyncIterable<Buffer | string>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    return {
      buffer,
      contentType: mime[ext] ?? "application/octet-stream",
      size: buffer.byteLength,
      filename: safe,
    };
  }
}

export const employeesService = new EmployeesService();
