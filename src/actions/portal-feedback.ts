"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/guards";
import { PortalError, portalService } from "@/services/portal.service";
import { portalFeedbackSubmitSchema } from "@/validators/portal-feedback.schema";

export type PortalFeedbackActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitPortalFeedbackAction(
  _prev: PortalFeedbackActionState,
  formData: FormData,
): Promise<PortalFeedbackActionState> {
  const session = await requireAuth();

  const parsed = portalFeedbackSubmitSchema.safeParse({
    category: formData.get("category") ?? "",
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors,
    };
  }

  try {
    await portalService.submitFeedback(session.user.id, parsed.data);
    revalidatePath("/portal/feedback");
    return {
      ok: true,
      message: "Feedback submitted successfully. HR will respond soon.",
    };
  } catch (error) {
    if (error instanceof PortalError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}
