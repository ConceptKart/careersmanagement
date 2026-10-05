const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** URL-safe segment from job title (no DB slug column). */
export function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "role"
  );
}

/** Canonical public URL segment: `{title-slug}-{uuid}`. */
export function jobSlug(job: { id: string; title: string }): string {
  return `${slugifyTitle(job.title)}-${job.id}`;
}

/** Resolve job id from slug param (full uuid or `{title}-{uuid}`). */
export function parseJobIdFromSlug(slug: string): string | null {
  const match = slug.trim().match(UUID_RE);
  return match ? match[0] : null;
}

export function jobDetailPath(job: { id: string; title: string }): string {
  return `/jobs/${jobSlug(job)}`;
}

export function jobApplyPath(job: { id: string; title: string }): string {
  return `${jobDetailPath(job)}/apply`;
}
