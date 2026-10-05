"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import {
  CompanyDocumentError,
  companyDocumentsService,
} from "@/services/company-documents.service";
import { adminCompanyDocCreateSchema } from "@/validators/admin-company-document.schema";
import { entityIdSchema } from "@/validators/id.schema";

export type CompanyDocActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createCompanyDocumentAction(
  _prev: CompanyDocActionState,
  formData: FormData,
): Promise<CompanyDocActionState> {
  const session = await requireAdmin();

  const parsed = adminCompanyDocCreateSchema.safeParse({
    documentType: formData.get("documentType") ?? "policy",
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    version: formData.get("version") ?? "",
    effectiveDate: formData.get("effectiveDate") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const rawFile = formData.get("file");
  let file: { buffer: Buffer; filename: string; mimeType: string; size: number } | null =
    null;
  if (rawFile instanceof File && rawFile.size > 0) {
    file = {
      buffer: Buffer.from(await rawFile.arrayBuffer()),
      filename: rawFile.name,
      mimeType: rawFile.type || "application/octet-stream",
      size: rawFile.size,
    };
  }

  try {
    await companyDocumentsService.createDocument(
      parsed.data,
      file,
      session.user.id,
    );
    revalidatePath("/admin/company-documents");
    return { ok: true, message: "Document uploaded." };
  } catch (error) {
    if (error instanceof CompanyDocumentError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    throw error;
  }
}

export async function toggleCompanyDocumentAction(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const idParsed = entityIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, message: "Invalid document ID." };
  const updated = await companyDocumentsService.toggleActive(idParsed.data);
  if (!updated) return { ok: false, message: "Document not found." };
  revalidatePath("/admin/company-documents");
  return { ok: true };
}

export async function deleteCompanyDocumentAction(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const idParsed = entityIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, message: "Invalid document ID." };
  const deleted = await companyDocumentsService.deleteDocument(idParsed.data);
  if (!deleted) return { ok: false, message: "Document not found." };
  revalidatePath("/admin/company-documents");
  return { ok: true, message: "Document deleted." };
}
