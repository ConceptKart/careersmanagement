import { z } from "zod";

export const applicationStatusSchema = z.enum([
  "new",
  "in_review",
  "shortlisted",
  "interview_scheduled",
  "rejected",
  "hired",
]);

export const screeningPrioritySchema = z.enum(["high", "medium", "low"]);

export const adminApplicationListFiltersSchema = z.object({
  q: z.string().trim().optional().default(""),
  job: z.string().trim().optional().default(""),
  status: z
    .enum([
      "all",
      "new",
      "in_review",
      "shortlisted",
      "interview_scheduled",
      "rejected",
      "hired",
    ])
    .optional()
    .default("all"),
  priority: z.enum(["all", "high", "medium", "low"]).optional().default("all"),
  dateFrom: z.string().trim().optional().default(""),
  dateTo: z.string().trim().optional().default(""),
  sort: z.enum(["recent", "score"]).optional().default("recent"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type AdminApplicationListFilters = z.infer<
  typeof adminApplicationListFiltersSchema
>;

export const ADMIN_APPLICATION_PAGE_SIZE = 15;

export const updateStatusSchema = z.object({
  applicationId: z.string().min(1, "Invalid application ID"),
  status: applicationStatusSchema,
});

export const updateAdminNotesSchema = z.object({
  applicationId: z.string().min(1, "Invalid application ID"),
  adminNotes: z.string().max(10000).optional().default(""),
});
