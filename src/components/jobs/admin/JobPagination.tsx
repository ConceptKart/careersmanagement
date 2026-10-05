import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  basePath?: string;
  itemLabel?: string;
  searchParams: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function JobPagination({
  page,
  totalPages,
  total,
  basePath = "/admin/jobs",
  itemLabel = "job",
  searchParams,
}: Props) {
  const plural = total === 1 ? itemLabel : `${itemLabel}s`;

  if (totalPages <= 1) {
    return (
      <p className="admin-pagination-meta text-muted-foreground">
        {total} {plural}
      </p>
    );
  }

  return (
    <div className="admin-pagination">
      <p className="text-muted-foreground">
        Page {page} of {totalPages} · {total} {plural}
      </p>
      <div className="admin-pagination-links">
        {page > 1 ? (
          <Link
            href={buildHref(basePath, searchParams, page - 1)}
            className="btn btn-outline btn-sm"
          >
            Previous
          </Link>
        ) : (
          <span className="btn btn-outline btn-sm" aria-disabled>
            Previous
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={buildHref(basePath, searchParams, page + 1)}
            className="btn btn-outline btn-sm"
          >
            Next
          </Link>
        ) : (
          <span className="btn btn-outline btn-sm" aria-disabled>
            Next
          </span>
        )}
      </div>
    </div>
  );
}
