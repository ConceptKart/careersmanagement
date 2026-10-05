"use server";

import { statusService } from "@/services/status.service";
import type { ApplicationStatusDetail } from "@/repositories/applications.repository";
import { logger } from "@/lib/logging/logger";
import { checkStatusLookupSchema } from "@/validators/status.schema";

export type CheckStatusActionState = {
  searched: boolean;
  ok: boolean;
  application?: ApplicationStatusDetail;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function checkApplicationStatusAction(
  _prev: CheckStatusActionState,
  formData: FormData,
): Promise<CheckStatusActionState> {
  const values = {
    applicationId: String(formData.get("applicationId") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = checkStatusLookupSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      searched: true,
      ok: false,
      message: "Please correct the errors below.",
      fieldErrors,
    };
  }

  try {
    const result = await statusService.lookup(parsed.data);

    if (!result.ok) {
      if (result.reason === "not_found") {
        return {
          searched: true,
          ok: false,
          message: "Application not found. Check your application ID and email.",
        };
      }
      return {
        searched: true,
        ok: false,
        message: "Please correct the errors below.",
        fieldErrors: result.fieldErrors,
      };
    }

    return {
      searched: true,
      ok: true,
      application: result.application,
    };
  } catch (error) {
    logger.error("checkApplicationStatusAction", error);
    return {
      searched: true,
      ok: false,
      message: "Unable to look up your application right now. Please try again.",
    };
  }
}
