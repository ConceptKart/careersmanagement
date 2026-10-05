import { z } from "zod";

export const portalFeedbackSubmitSchema = z.object({
  category: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  subject: z.string().trim().min(1, "Subject is required").max(255),
  message: z.string().trim().min(1, "Message is required").max(10000),
});

export type PortalFeedbackSubmitValues = z.infer<
  typeof portalFeedbackSubmitSchema
>;
