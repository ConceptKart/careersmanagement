import { z } from "zod";

export const ADMIN_FEEDBACK_PAGE_SIZE = 15;

export const adminFeedbackListFiltersSchema = z.object({
  q: z.string().trim().optional().default(""),
  status: z.enum(["all", "open", "resolved"]).optional().default("open"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type AdminFeedbackListFilters = z.infer<
  typeof adminFeedbackListFiltersSchema
>;

export const adminFeedbackRespondSchema = z.object({
  feedbackId: z.string().min(1),
  hrResponse: z.string().trim().max(10000).optional().default(""),
});

export type AdminFeedbackRespondValues = z.infer<
  typeof adminFeedbackRespondSchema
>;
