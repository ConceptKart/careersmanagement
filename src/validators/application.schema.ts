import { z } from "zod";

/** Letters and spaces only (names, cities). */
export const ALPHA_SPACE_REGEX = /^[A-Za-z\s]+$/;

/** Indian mobile: exactly 10 digits, starts with 6–9. */
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

const nameSchema = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .max(200, "Full name is too long")
  .regex(ALPHA_SPACE_REGEX, "Only letters and spaces are allowed");

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .regex(
    INDIAN_MOBILE_REGEX,
    "Enter a valid 10-digit mobile number starting with 6–9",
  );

const citySchema = z
  .string()
  .trim()
  .min(1, "Current city is required")
  .max(100, "Current city is too long")
  .regex(ALPHA_SPACE_REGEX, "Only letters and spaces are allowed");

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .refine((value) => !value || /^https?:\/\/.+/i.test(value), "Enter a valid URL");

/**
 * Application form — single source of truth for client (RHF) and server (Server Action).
 * Extra profile fields are persisted in cover_letter (no dedicated DB columns).
 */
export const applyFormSchema = z.object({
  name: nameSchema,
  email: z.string().trim().email("Valid email is required").max(320),
  phone: phoneSchema,
  currentCity: citySchema,
  experience: z.string().trim().min(1, "Experience is required").max(100),
  currentCompany: z.string().trim().min(1, "Current company is required").max(200),
  currentCtc: z.string().trim().min(1, "Current CTC is required").max(100),
  expectedCtc: z.string().trim().min(1, "Expected CTC is required").max(100),
  noticePeriod: z.string().trim().min(1, "Notice period is required").max(100),
  linkedinUrl: optionalUrlSchema,
  portfolioUrl: optionalUrlSchema,
  coverLetter: z.string().trim().max(5000).optional(),
});

export type ApplyFormValues = z.infer<typeof applyFormSchema>;

export const checkStatusSchema = z.object({
  email: z.string().trim().email("Valid email is required").max(320),
});

export const jobListFiltersSchema = z.object({
  q: z.string().trim().optional().default(""),
  dept: z.string().trim().optional().default(""),
  loc: z.string().trim().optional().default(""),
  type: z.string().trim().optional().default(""),
});

export type JobListFilters = z.infer<typeof jobListFiltersSchema>;