"use server";

import { ApplicationError, applicationsService } from "@/services/applications.service";
import { logger } from "@/lib/logging/logger";
import { applyFormSchema } from "@/validators/application.schema";

export type ApplyActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  jobTitle?: string;
  applicationId?: string;
  email?: string;
};

function readFormValues(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    currentCity: String(formData.get("currentCity") ?? ""),
    experience: String(formData.get("experience") ?? ""),
    currentCompany: String(formData.get("currentCompany") ?? ""),
    currentCtc: String(formData.get("currentCtc") ?? ""),
    expectedCtc: String(formData.get("expectedCtc") ?? ""),
    noticePeriod: String(formData.get("noticePeriod") ?? ""),
    linkedinUrl: String(formData.get("linkedinUrl") ?? ""),
    portfolioUrl: String(formData.get("portfolioUrl") ?? ""),
    coverLetter: String(formData.get("coverLetter") ?? ""),
  };
}

export async function submitApplicationAction(
  _prev: ApplyActionState,
  formData: FormData,
): Promise<ApplyActionState> {
  const jobId = String(formData.get("jobId") ?? "");
  const values = readFormValues(formData);

  const parsed = applyFormSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Validation failed", fieldErrors };
  }

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      message: "Resume is required",
      fieldErrors: { resume: "Resume is required" },
    };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await applicationsService.submit(jobId, parsed.data, {
      buffer,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
    return {
      ok: true,
      jobTitle: result.jobTitle,
      applicationId: result.applicationId,
      email: parsed.data.email,
      message: "Application submitted",
    };
  } catch (err) {
    if (err instanceof ApplicationError) {
      return {
        ok: false,
        message: err.message,
        fieldErrors: err.fieldErrors,
      };
    }
    logger.error("submitApplicationAction", err);
    return { ok: false, message: "Failed to submit application" };
  }
}
