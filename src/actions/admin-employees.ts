"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import {
  EmployeeError,
  employeesService,
} from "@/services/employees.service";
import {
  adminEmployeeCreateSchema,
  adminEmployeeDocumentSchema,
  adminEmployeeUpdateSchema,
  type AdminEmployeeCreateValues,
  type AdminEmployeeUpdateValues,
} from "@/validators/admin-employee.schema";
import { entityIdSchema } from "@/validators/id.schema";

export type EmployeeFormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<
    Record<keyof AdminEmployeeCreateValues | keyof AdminEmployeeUpdateValues | "file", string>
  >;
};

export type DocumentFormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[],
): EmployeeFormActionState["fieldErrors"] {
  const fieldErrors: EmployeeFormActionState["fieldErrors"] = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !(key in (fieldErrors ?? {}))) {
      (fieldErrors as Record<string, string>)[key] = issue.message;
    }
  }
  return fieldErrors;
}

function parseCreateForm(formData: FormData): unknown {
  return {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    position: formData.get("position"),
    department: formData.get("department"),
    employmentType: formData.get("employmentType") ?? "full_time",
    dateOfJoining: formData.get("dateOfJoining"),
    salary: formData.get("salary") ?? "",
    managerId: formData.get("managerId") ?? "",
    status: formData.get("status") ?? "active",
    notes: formData.get("notes") ?? "",
  };
}

function parseUpdateForm(formData: FormData): unknown {
  return {
    fullName: formData.get("fullName"),
    phone: formData.get("phone") ?? "",
    position: formData.get("position"),
    department: formData.get("department"),
    employmentType: formData.get("employmentType") ?? "full_time",
    dateOfJoining: formData.get("dateOfJoining"),
    dateOfExit: formData.get("dateOfExit") ?? "",
    salary: formData.get("salary") ?? "",
    managerId: formData.get("managerId") ?? "",
    status: formData.get("status") ?? "active",
    notes: formData.get("notes") ?? "",
  };
}

export async function createEmployeeAction(
  _prev: EmployeeFormActionState,
  formData: FormData,
): Promise<EmployeeFormActionState> {
  await requireAdmin();

  const parsed = adminEmployeeCreateSchema.safeParse(parseCreateForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  let employeeId: string;
  try {
    const employee = await employeesService.createEmployee(parsed.data);
    employeeId = employee.id;
  } catch (error) {
    if (error instanceof EmployeeError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/employees");
  redirect(`/admin/employees/${employeeId}?toast=created`);
}

export async function updateEmployeeAction(
  employeeId: string,
  _prev: EmployeeFormActionState,
  formData: FormData,
): Promise<EmployeeFormActionState> {
  await requireAdmin();

  const parsed = adminEmployeeUpdateSchema.safeParse(parseUpdateForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    const updated = await employeesService.updateEmployee(employeeId, parsed.data);
    if (!updated) {
      return { ok: false, message: "Employee not found." };
    }
  } catch (error) {
    if (error instanceof EmployeeError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/employees");
  revalidatePath(`/admin/employees/${employeeId}`);
  redirect(`/admin/employees/${employeeId}?toast=updated`);
}

export async function uploadEmployeeDocumentAction(
  employeeId: string,
  _prev: DocumentFormActionState,
  formData: FormData,
): Promise<DocumentFormActionState> {
  const session = await requireAdmin();

  const parsed = adminEmployeeDocumentSchema.safeParse({
    employeeId,
    documentType: formData.get("documentType") ?? "other",
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    amount: formData.get("amount") ?? "",
    period: formData.get("period") ?? "",
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
    const buffer = Buffer.from(await rawFile.arrayBuffer());
    file = {
      buffer,
      filename: rawFile.name,
      mimeType: rawFile.type || "application/octet-stream",
      size: rawFile.size,
    };
  }

  try {
    await employeesService.addDocument(parsed.data, file, session.user.id);
    revalidatePath(`/admin/employees/${employeeId}`);
    revalidatePath("/admin/employee-documents");
    return { ok: true, message: "Document added." };
  } catch (error) {
    if (error instanceof EmployeeError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    throw error;
  }
}

export async function deleteEmployeeDocumentAction(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const idParsed = entityIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, message: "Invalid document ID." };
  const deleted = await employeesService.deleteDocument(idParsed.data);
  if (!deleted) return { ok: false, message: "Document not found." };
  revalidatePath("/admin/employee-documents");
  revalidatePath(`/admin/employees/${deleted.employeeId}`);
  return { ok: true, message: "Document deleted." };
}
