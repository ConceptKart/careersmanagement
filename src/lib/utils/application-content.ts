import type { ApplyFormValues } from "@/validators/application.schema";

/** Pack extra profile fields into cover_letter (schema has no dedicated columns). */
export function buildStoredCoverLetter(values: ApplyFormValues): string | undefined {
  const lines = [
    "--- Candidate Details ---",
    `Current City: ${values.currentCity}`,
    `Experience: ${values.experience}`,
    `Current Company: ${values.currentCompany}`,
    `Current CTC: ${values.currentCtc}`,
    `Expected CTC: ${values.expectedCtc}`,
    `Notice Period: ${values.noticePeriod}`,
  ];

  if (values.portfolioUrl?.trim()) {
    lines.push(`Portfolio: ${values.portfolioUrl.trim()}`);
  }

  if (values.coverLetter?.trim()) {
    lines.push("", "--- Cover Letter ---", values.coverLetter.trim());
  }

  return lines.join("\n");
}
