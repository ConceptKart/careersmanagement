import { z } from "zod";

export const ADMIN_ACHIEVEMENT_PAGE_SIZE = 15;

export const adminAchievementListFiltersSchema = z.object({
  q: z.string().trim().optional().default(""),
  employeeId: z.string().trim().optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type AdminAchievementListFilters = z.infer<
  typeof adminAchievementListFiltersSchema
>;

export const adminAchievementFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  achievedOn: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Achieved date is required"),
});

export type AdminAchievementFormValues = z.infer<typeof adminAchievementFormSchema>;
