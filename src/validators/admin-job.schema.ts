import { z } from "zod";

export const jobTypeSchema = z.enum([
  "full_time",
  "part_time",
  "contract",
  "internship",
]);

export const adminJobFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  department: z.string().trim().min(1, "Department is required").max(100),
  location: z.string().trim().min(1, "Location is required").max(100),
  jobType: jobTypeSchema,
  description: z.string().trim().min(1, "Description is required"),
  requirements: z.string().trim().min(1, "Requirements are required"),
  keyResponsibilities: z.string().trim().max(10000).optional().or(z.literal("")),
  salaryOffered: z.string().trim().max(255).optional().or(z.literal("")),
  screeningKeywords: z.string().trim().max(2000).optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type AdminJobFormValues = z.infer<typeof adminJobFormSchema>;

export const adminJobListFiltersSchema = z.object({
  q: z.string().trim().optional().default(""),
  dept: z.string().trim().optional().default(""),
  loc: z.string().trim().optional().default(""),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type AdminJobListFilters = z.infer<typeof adminJobListFiltersSchema>;

export const ADMIN_JOB_PAGE_SIZE = 10;

/** Map form / URL job type to Prisma JobType. */
export function toPrismaJobType(
  value: string,
): "full_time" | "part_time" | "contract" | "internship" {
  const map: Record<string, "full_time" | "part_time" | "contract" | "internship"> = {
    full_time: "full_time",
    "full-time": "full_time",
    part_time: "part_time",
    "part-time": "part_time",
    contract: "contract",
    internship: "internship",
  };
  return map[value] ?? "full_time";
}

export function keywordsToJson(raw: string | undefined | null): string | null {
  if (!raw?.trim()) return null;
  const keywords = raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return keywords.length ? JSON.stringify(keywords) : null;
}

export function keywordsFromJson(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.join(", ");
  } catch {
    return raw;
  }
  return raw;
}
