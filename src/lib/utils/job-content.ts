/**
 * screening_keywords is stored as JSON array in PHP admin (comma-separated in forms).
 */
export function parseScreeningKeywords(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch {
    // fall through to comma-separated
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * No dedicated benefits column — extract a "Benefits" subsection from description when present.
 */
export function extractBenefits(description: string | null | undefined): string | null {
  if (!description?.trim()) return null;

  const match = description.match(
    /(?:^|\n)\s*benefits?\s*[:\-]?\s*\n([\s\S]*?)(?=\n\s*[A-Z][\w\s/&-]{2,40}\s*[:\-]?\s*\n|$)/i,
  );
  if (!match?.[1]?.trim()) return null;

  const text = match[1].trim();
  return text.length > 0 ? text : null;
}

/** Plain multiline text for overview blocks (preserves line breaks). */
export function formatJobText(text: string): string {
  return text.trim();
}
