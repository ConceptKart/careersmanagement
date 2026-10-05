import { promises as fs } from "fs";
import path from "path";
import { getStorage } from "@/lib/storage";
import { validateDocumentUpload } from "@/lib/uploads/document-file";
import { generateId } from "@/lib/utils/id";
import {
  companyDocumentsRepository,
  type AdminCompanyDocListResult,
} from "@/repositories/company-documents.repository";
import type {
  AdminCompanyDocCreateValues,
  AdminCompanyDocListFilters,
} from "@/validators/admin-company-document.schema";

export class CompanyDocumentError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "CompanyDocumentError";
  }
}

export type UploadFile = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
};

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/** Sanitize company doc path: `{type}/{uuid}.ext` under documents/. */
export function sanitizeCompanyDocPath(file: string): string | null {
  let normalized = file.replace(/%2F/gi, "/").replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalized.startsWith("documents/")) {
    normalized = normalized.slice("documents/".length);
  }
  if (!normalized || normalized.includes("..")) return null;
  const parts = normalized.split("/");
  if (parts.length !== 2) return null;
  const [type, name] = parts;
  if (!/^[a-z_]+$/.test(type)) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null;
  return `${type}/${name}`;
}

export class CompanyDocumentsService {
  async getDocuments(
    filters: AdminCompanyDocListFilters,
  ): Promise<AdminCompanyDocListResult> {
    return companyDocumentsRepository.findAdminList(filters);
  }

  async createDocument(
    values: AdminCompanyDocCreateValues,
    file: UploadFile | null,
    uploadedBy: string | null,
  ) {
    let filePath: string | null = null;
    if (file && file.size > 0) {
      const validated = validateDocumentUpload(file);
      if (!validated.ok) {
        throw new CompanyDocumentError("Invalid file", { file: validated.message });
      }
      // PHP: documents/{document_type}/{uuid}.{ext}; DB stores {type}/{uuid}.{ext}
      const relative = `${values.documentType}/${generateId()}.${validated.ext}`;
      await getStorage().put({
        key: `documents/${relative}`,
        data: file.buffer,
        contentType: file.mimeType || "application/octet-stream",
      });
      filePath = relative;
    }

    return companyDocumentsRepository.create({
      documentType: values.documentType,
      title: values.title,
      description: values.description ?? null,
      filePath,
      version: values.version ?? null,
      effectiveDate: values.effectiveDate
        ? parseDateOnly(values.effectiveDate)
        : null,
      uploadedBy,
    });
  }

  async toggleActive(id: string) {
    return companyDocumentsRepository.toggleActive(id);
  }

  async deleteDocument(id: string) {
    // PHP deletes DB row only; file left on disk.
    return companyDocumentsRepository.delete(id);
  }

  async downloadDocument(filePath: string): Promise<{
    buffer: Buffer;
    contentType: string;
    size: number;
    filename: string;
  } | null> {
    const safe = sanitizeCompanyDocPath(filePath);
    if (!safe) return null;

    const key = `documents/${safe}`;
    const storage = getStorage();
    if (!storage.exists || !(await storage.exists(key))) return null;

    const filename = path.basename(safe);
    const ext = path.extname(filename).slice(1).toLowerCase();

    if (typeof storage.resolveLocalPath === "function") {
      const fullPath = storage.resolveLocalPath(key);
      if (!fullPath) return null;
      const buffer = await fs.readFile(fullPath);
      return {
        buffer,
        contentType: MIME[ext] ?? "application/octet-stream",
        size: buffer.byteLength,
        filename,
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
      contentType: MIME[ext] ?? "application/octet-stream",
      size: buffer.byteLength,
      filename,
    };
  }
}

export const companyDocumentsService = new CompanyDocumentsService();
