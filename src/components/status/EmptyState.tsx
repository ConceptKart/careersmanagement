type Props = {
  title?: string;
  message: string;
};

export function EmptyState({
  title = "Application not found",
  message,
}: Props) {
  return (
    <div className="empty-state status-empty-state" role="status">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
