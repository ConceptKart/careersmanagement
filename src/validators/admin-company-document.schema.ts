import { z } from "zod";

export const companyDocumentTypeSchema = z.enum([
  "org_chart",
  "policy",
  "handbook",
  "other",
]);

export const ADMIN_COMPANY_DOC_PAGE_SIZE = 15;

export const adminCompanyDocListFiltersSchema = z.object({
  q: z.string().trim().optional().default(""),
  type: z
    .enum(["all", "org_chart", "policy", "handbook", "other"])
    .optional()
    .default("all"),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type AdminCompanyDocListFilters = z.infer<
  typeof adminCompanyDocListFiltersSchema
>;

export const adminCompanyDocCreateSchema = z.object({
  documentType: companyDocumentTypeSchema.default("policy"),
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  version: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  effectiveDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Use YYYY-MM-DD",
    ),
});

export type AdminCompanyDocCreateValues = z.infer<
  typeof adminCompanyDocCreateSchema
>;
