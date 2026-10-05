type Props = {
  title?: string;
  message?: string;
};

/** Empty results for jobs listing (matches PHP empty-state). */
export function EmptyState({
  title = "No roles found",
  message = "Try adjusting your search or filters.",
}: Props) {
  return (
    <div className="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
