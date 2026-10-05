import { z } from "zod";

export const employmentTypeSchema = z.enum([
  "full_time",
  "part_time",
  "contract",
  "internship",
]);

export const employeeStatusSchema = z.enum([
  "active",
  "on_leave",
  "terminated",
  "resigned",
]);

export const employeeDocumentTypeSchema = z.enum([
  "offer_letter",
  "salary_slip",
  "increment_letter",
  "employment_history",
  "other",
]);

export const ADMIN_EMPLOYEE_PAGE_SIZE = 15;

export const adminEmployeeListFiltersSchema = z.object({
  q: z.string().trim().optional().default(""),
  department: z.string().trim().optional().default(""),
  status: z
    .enum(["all", "active", "on_leave", "terminated", "resigned"])
    .optional()
    .default("all"),
  sort: z
    .enum(["recent", "name", "department", "joining"])
    .optional()
    .default("recent"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type AdminEmployeeListFilters = z.infer<
  typeof adminEmployeeListFiltersSchema
>;

const optionalPhone = z
  .string()
  .trim()
  .max(40)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalNotes = z
  .string()
  .trim()
  .max(10000)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalSalary = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .refine(
    (v) => v === undefined || (!Number.isNaN(Number(v)) && Number(v) >= 0),
    "Salary must be a non-negative number",
  );

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .refine(
    (v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v),
    "Use YYYY-MM-DD",
  );

const optionalManagerId = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

/** Create form — email required; date_of_exit not on create (PHP parity). */
export const adminEmployeeCreateSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  email: z.string().trim().email("Valid email is required").max(320),
  phone: optionalPhone,
  position: z.string().trim().min(1, "Designation is required").max(100),
  department: z.string().trim().min(1, "Department is required").max(100),
  employmentType: employmentTypeSchema.default("full_time"),
  dateOfJoining: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Joining date is required"),
  salary: optionalSalary,
  managerId: optionalManagerId,
  status: employeeStatusSchema.default("active"),
  notes: optionalNotes,
});

export type AdminEmployeeCreateValues = z.infer<typeof adminEmployeeCreateSchema>;

/** Edit form — email immutable (omitted from update payload). */
export const adminEmployeeUpdateSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  phone: optionalPhone,
  position: z.string().trim().min(1, "Designation is required").max(100),
  department: z.string().trim().min(1, "Department is required").max(100),
  employmentType: employmentTypeSchema,
  dateOfJoining: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Joining date is required"),
  dateOfExit: optionalDate,
  salary: optionalSalary,
  managerId: optionalManagerId,
  status: employeeStatusSchema,
  notes: optionalNotes,
});

export type AdminEmployeeUpdateValues = z.infer<typeof adminEmployeeUpdateSchema>;

export const adminEmployeeDocumentSchema = z.object({
  employeeId: z.string().min(1),
  documentType: employeeDocumentTypeSchema,
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  amount: optionalSalary,
  period: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  effectiveDate: optionalDate,
});

export type AdminEmployeeDocumentValues = z.infer<
  typeof adminEmployeeDocumentSchema
>;

export function toEmploymentType(
  value: string,
): z.infer<typeof employmentTypeSchema> {
  const map: Record<string, z.infer<typeof employmentTypeSchema>> = {
    full_time: "full_time",
    "full-time": "full_time",
    part_time: "part_time",
    "part-time": "part_time",
    contract: "contract",
    internship: "internship",
  };
  return map[value] ?? "full_time";
}
