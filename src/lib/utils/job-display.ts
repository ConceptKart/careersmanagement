/** Truncate plain text for card previews. */
export function shortDescription(text: string, max = 140): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trimEnd()}…`;
}

/**
 * No dedicated experience column in MySQL — best-effort extract from requirements
 * (e.g. "3+ years of frontend development…").
 */
export function extractExperience(requirements: string | null | undefined): string | null {
  if (!requirements) return null;
  const match = requirements.match(
    /(\d+\s*\+?\s*(?:[-–]\s*\d+\s*\+?\s*)?years?(?:\s+of\s+[\w\s/-]+)?)/i,
  );
  if (!match) return null;
  const snippet = match[1].replace(/\s+/g, " ").trim();
  return snippet.length > 60 ? `${snippet.slice(0, 57)}…` : snippet;
}
