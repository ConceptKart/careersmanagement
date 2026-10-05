"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import {
  AchievementError,
  achievementsService,
} from "@/services/achievements.service";
import {
  adminAchievementFormSchema,
  type AdminAchievementFormValues,
} from "@/validators/admin-achievement.schema";
import { entityIdSchema } from "@/validators/id.schema";

export type AchievementFormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof AdminAchievementFormValues, string>>;
};

function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[],
): AchievementFormActionState["fieldErrors"] {
  const fieldErrors: AchievementFormActionState["fieldErrors"] = {};
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
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    achievedOn: formData.get("achievedOn"),
  };
}

export async function createAchievementAction(
  _prev: AchievementFormActionState,
  formData: FormData,
): Promise<AchievementFormActionState> {
  const session = await requireAdmin();
  const parsed = adminAchievementFormSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await achievementsService.createAchievement(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof AchievementError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    throw error;
  }

  revalidatePath("/admin/achievements");
  revalidatePath(`/admin/employees/${parsed.data.employeeId}`);
  redirect("/admin/achievements?toast=created");
}

export async function updateAchievementAction(
  id: string,
  _prev: AchievementFormActionState,
  formData: FormData,
): Promise<AchievementFormActionState> {
  await requireAdmin();
  const parsed = adminAchievementFormSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    const updated = await achievementsService.updateAchievement(id, parsed.data);
    if (!updated) return { ok: false, message: "Achievement not found." };
  } catch (error) {
    if (error instanceof AchievementError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    throw error;
  }

  revalidatePath("/admin/achievements");
  revalidatePath(`/admin/employees/${parsed.data.employeeId}`);
  redirect("/admin/achievements?toast=updated");
}

export async function deleteAchievementAction(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const idParsed = entityIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, message: "Invalid achievement ID." };
  const deleted = await achievementsService.deleteAchievement(idParsed.data);
  if (!deleted) return { ok: false, message: "Achievement not found." };
  revalidatePath("/admin/achievements");
  return { ok: true, message: "Achievement deleted." };
}
