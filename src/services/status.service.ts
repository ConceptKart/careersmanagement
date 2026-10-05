import { applicationsRepository } from "@/repositories/applications.repository";
import type { ApplicationStatusDetail } from "@/repositories/applications.repository";
import {
  checkStatusLookupSchema,
  type CheckStatusLookupInput,
} from "@/validators/status.schema";

export type StatusLookupResult =
  | { ok: true; application: ApplicationStatusDetail }
  | { ok: false; reason: "not_found" | "validation"; fieldErrors?: Record<string, string> };

/**
 * Secure status lookup — requires matching application ID and email.
 * Returns a generic not-found result for any mismatch (no email enumeration).
 */
export class StatusService {
  lookup(input: CheckStatusLookupInput): Promise<StatusLookupResult> {
    return this.lookupValidated(input);
  }

  private async lookupValidated(input: CheckStatusLookupInput): Promise<StatusLookupResult> {
    const parsed = checkStatusLookupSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { ok: false, reason: "validation", fieldErrors };
    }

    const application = await applicationsRepository.findStatusByIdAndEmail(
      parsed.data.applicationId,
      parsed.data.email,
    );

    if (!application) {
      return { ok: false, reason: "not_found" };
    }

    return { ok: true, application };
  }
}

export const statusService = new StatusService();
