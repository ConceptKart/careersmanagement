import { z } from "zod";

export const ADMIN_SALARY_PAGE_SIZE = 15;

export const adminSalaryListFiltersSchema = z.object({
  q: z.string().trim().optional().default(""),
  employeeId: z.string().trim().optional().default(""),
  month: z.string().trim().optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type AdminSalaryListFilters = z.infer<typeof adminSalaryListFiltersSchema>;

const money = z
  .string()
  .trim()
  .min(1, "Required")
  .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "Must be ≥ 0");

const optionalMoney = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : "0"))
  .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "Must be ≥ 0");

export const adminSalaryFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  month: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, "Month must be YYYY-MM"),
  basicSalary: money,
  hra: optionalMoney,
  allowances: optionalMoney,
  deductions: optionalMoney,
  netSalary: money,
  paidOn: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Use YYYY-MM-DD",
    ),
});

export type AdminSalaryFormValues = z.infer<typeof adminSalaryFormSchema>;

export const ADMIN_EMPLOYEE_DOC_PAGE_SIZE = 15;

export const adminEmployeeDocListFiltersSchema = z.object({
  q: z.string().trim().optional().default(""),
  employeeId: z.string().trim().optional().default(""),
  type: z
    .enum([
      "all",
      "offer_letter",
      "salary_slip",
      "increment_letter",
      "employment_history",
      "other",
    ])
    .optional()
    .default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type AdminEmployeeDocListFilters = z.infer<
  typeof adminEmployeeDocListFiltersSchema
>;
