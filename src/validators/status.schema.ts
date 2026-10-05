import { z } from "zod";

const applicationIdSchema = z
  .string()
  .trim()
  .min(1, "Application ID is required")
  .max(36, "Invalid application ID")
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Enter a valid application ID",
  );

export const checkStatusLookupSchema = z.object({
  applicationId: applicationIdSchema,
  email: z.string().trim().email("Valid email is required").max(320),
});

export type CheckStatusLookupInput = z.infer<typeof checkStatusLookupSchema>;
