"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { jobsService } from "@/services/jobs.service";
import {
  adminJobFormSchema,
  type AdminJobFormValues,
} from "@/validators/admin-job.schema";
import { entityIdSchema } from "@/validators/id.schema";

export type JobFormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof AdminJobFormValues, string>>;
};

function parseFormData(formData: FormData): unknown {
  return {
    title: formData.get("title"),
    department: formData.get("department"),
    location: formData.get("location"),
    jobType: formData.get("jobType"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    keyResponsibilities: formData.get("keyResponsibilities") ?? "",
    salaryOffered: formData.get("salaryOffered") ?? "",
    screeningKeywords: formData.get("screeningKeywords") ?? "",
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  };
}

function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[],
): JobFormActionState["fieldErrors"] {
  const fieldErrors: JobFormActionState["fieldErrors"] = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !(key in (fieldErrors ?? {}))) {
      (fieldErrors as Record<string, string>)[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function createJobAction(
  _prev: JobFormActionState,
  formData: FormData,
): Promise<JobFormActionState> {
  await requireAdmin();

  const parsed = adminJobFormSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const job = await jobsService.createJob(parsed.data);
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  redirect(`/admin/jobs/${job.id}?toast=created`);
}

export async function updateJobAction(
  jobId: string,
  _prev: JobFormActionState,
  formData: FormData,
): Promise<JobFormActionState> {
  await requireAdmin();

  const existing = await jobsService.getJob(jobId);
  if (!existing) {
    return { ok: false, message: "Job not found." };
  }

  const parsed = adminJobFormSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  await jobsService.updateJob(jobId, parsed.data);
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/jobs");
  redirect(`/admin/jobs/${jobId}?toast=updated`);
}

export async function toggleJobStatusAction(
  jobId: string,
  isActive: boolean,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();

  const idParsed = entityIdSchema.safeParse(jobId);
  if (!idParsed.success) return { ok: false, message: "Invalid job ID." };

  const job = await jobsService.toggleStatus(idParsed.data, isActive);
  if (!job) return { ok: false, message: "Job not found." };

  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${idParsed.data}`);
  revalidatePath("/jobs");
  return {
    ok: true,
    message: isActive ? "Job published." : "Job unpublished.",
  };
}

export async function deleteJobAction(
  jobId: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();

  const idParsed = entityIdSchema.safeParse(jobId);
  if (!idParsed.success) return { ok: false, message: "Invalid job ID." };

  const result = await jobsService.deleteJob(idParsed.data);
  if (!result.ok) {
    if (result.reason === "has_applications") {
      return {
        ok: false,
        message: `Cannot delete: ${result.count} application(s) exist. Deactivate the job instead.`,
      };
    }
    return { ok: false, message: "Job not found." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return { ok: true, message: "Job deleted." };
}

export async function duplicateJobAction(
  jobId: string,
): Promise<{ ok: boolean; message?: string; newId?: string }> {
  await requireAdmin();

  const idParsed = entityIdSchema.safeParse(jobId);
  if (!idParsed.success) return { ok: false, message: "Invalid job ID." };

  const copy = await jobsService.duplicateJob(idParsed.data);
  if (!copy) return { ok: false, message: "Job not found." };

  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  return {
    ok: true,
    message: "Job duplicated as draft (inactive).",
    newId: copy.id,
  };
}
