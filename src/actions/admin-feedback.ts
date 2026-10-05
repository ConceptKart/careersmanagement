"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { feedbackService } from "@/services/feedback.service";
import { adminFeedbackRespondSchema } from "@/validators/admin-feedback.schema";

export type FeedbackRespondState = {
  ok: boolean;
  message?: string;
};

export async function respondToFeedbackAction(
  feedbackId: string,
  _prev: FeedbackRespondState,
  formData: FormData,
): Promise<FeedbackRespondState> {
  await requireAdmin();

  const parsed = adminFeedbackRespondSchema.safeParse({
    feedbackId,
    hrResponse: formData.get("hrResponse") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid response.",
    };
  }

  const updated = await feedbackService.respond(
    parsed.data.feedbackId,
    parsed.data.hrResponse,
  );
  if (!updated) return { ok: false, message: "Feedback not found." };

  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
  return { ok: true, message: "Response saved. Marked as resolved." };
}
