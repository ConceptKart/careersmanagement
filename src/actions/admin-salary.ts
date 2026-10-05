"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { SalaryError, salaryRecordsService } from "@/services/salary-records.service";
import {
  adminSalaryFormSchema,
  type AdminSalaryFormValues,
} from "@/validators/admin-salary.schema";

export type SalaryFormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof AdminSalaryFormValues, string>>;
};

function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[],
): SalaryFormActionState["fieldErrors"] {
  const fieldErrors: SalaryFormActionState["fieldErrors"] = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !(key in (fieldErrors ?? {}))) {
      (fieldErrors as Record<string, string>)[key] = issue.message;
    }
  }
  return fieldErrors;
}

function parseForm(formData: FormData) {
  return {
    employeeId: formData.get("employeeId"),
    month: formData.get("month"),
    basicSalary: formData.get("basicSalary"),
    hra: formData.get("hra") ?? "0",
    allowances: formData.get("allowances") ?? "0",
    deductions: formData.get("deductions") ?? "0",
    netSalary: formData.get("netSalary"),
    paidOn: formData.get("paidOn") ?? "",
  };
}

export async function createSalaryRecordAction(
  _prev: SalaryFormActionState,
  formData: FormData,
): Promise<SalaryFormActionState> {
  await requireAdmin();
  const parsed = adminSalaryFormSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await salaryRecordsService.createRecord(parsed.data);
  } catch (error) {
    if (error instanceof SalaryError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    throw error;
  }

  revalidatePath("/admin/salary");
  revalidatePath(`/admin/employees/${parsed.data.employeeId}`);
  redirect("/admin/salary?toast=created");
}

export async function updateSalaryRecordAction(
  id: string,
  _prev: SalaryFormActionState,
  formData: FormData,
): Promise<SalaryFormActionState> {
  await requireAdmin();
  const parsed = adminSalaryFormSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    const updated = await salaryRecordsService.updateRecord(id, parsed.data);
    if (!updated) return { ok: false, message: "Salary record not found." };
  } catch (error) {
    if (error instanceof SalaryError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    throw error;
  }

  revalidatePath("/admin/salary");
  revalidatePath(`/admin/employees/${parsed.data.employeeId}`);
  redirect("/admin/salary?toast=updated");
}
