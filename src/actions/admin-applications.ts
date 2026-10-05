"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { applicationsService } from "@/services/applications.service";
import {
  updateAdminNotesSchema,
  updateStatusSchema,
} from "@/validators/admin-application.schema";

export type MutationResult = {
  ok: boolean;
  message?: string;
};

export async function updateApplicationStatusAction(
  applicationId: string,
  status: string,
): Promise<MutationResult> {
  await requireAdmin();

  const parsed = updateStatusSchema.safeParse({ applicationId, status });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid status." };
  }

  const updated = await applicationsService.updateStatus(
    parsed.data.applicationId,
    parsed.data.status,
  );
  if (!updated) return { ok: false, message: "Application not found." };

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  return { ok: true, message: "Status updated." };
}

export async function updateAdminNotesAction(
  _prev: MutationResult,
  formData: FormData,
): Promise<MutationResult> {
  await requireAdmin();

  const parsed = updateAdminNotesSchema.safeParse({
    applicationId: formData.get("applicationId"),
    adminNotes: formData.get("adminNotes") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid notes." };
  }

  const updated = await applicationsService.updateAdminNotes(
    parsed.data.applicationId,
    parsed.data.adminNotes,
  );
  if (!updated) return { ok: false, message: "Application not found." };

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${parsed.data.applicationId}`);
  return { ok: true, message: "Notes saved." };
}
