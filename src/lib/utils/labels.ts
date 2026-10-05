export function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_review: "In Review",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview Scheduled",
  rejected: "Rejected",
  hired: "Hired",
};

export function getStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}

export function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    in_review: "bg-amber-100 text-amber-800",
    shortlisted: "bg-violet-100 text-violet-800",
    interview_scheduled: "bg-indigo-100 text-indigo-800",
    rejected: "bg-red-100 text-red-800",
    hired: "bg-emerald-100 text-emerald-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

const EMPLOYEE_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_leave: "On Leave",
  terminated: "Terminated",
  resigned: "Resigned",
};

export function getEmployeeStatusLabel(status: string): string {
  return EMPLOYEE_STATUS_LABELS[status] ?? status;
}

export function getEmployeeStatusClass(status: string): string {
  const map: Record<string, string> = {
    active: "badge badge-emerald",
    on_leave: "badge badge-amber",
    terminated: "badge badge-red",
    resigned: "badge badge-gray",
  };
  return map[status] ?? "badge badge-gray";
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  offer_letter: "Offer Letter",
  salary_slip: "Salary Slip",
  increment_letter: "Increment Letter",
  employment_history: "Employment History",
  other: "Other",
};

export function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] ?? type;
}

const COMPANY_DOC_LABELS: Record<string, string> = {
  org_chart: "Org Chart",
  policy: "Policy",
  handbook: "Handbook",
  other: "Other",
};

export function getCompanyDocLabel(type: string): string {
  return COMPANY_DOC_LABELS[type] ?? type;
}

export function formatINR(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format a Date/ISO string as YYYY-MM-DD for date inputs. */
export function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  "full-time": "Full-time",
  part_time: "Part-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

export function getJobTypeLabel(type: string): string {
  return JOB_TYPE_LABELS[type] ?? type;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export { generateId } from "./id";
