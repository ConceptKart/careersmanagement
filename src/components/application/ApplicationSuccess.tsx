import Link from "next/link";

type Props = {
  jobTitle: string;
  applicationId?: string;
  email?: string;
};

export function ApplicationSuccess({ jobTitle, applicationId, email }: Props) {
  return (
    <div className="success-state">
      <div className="success-icon" aria-hidden>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.75rem" }}>
        Application submitted
      </h1>
      <p className="text-muted-foreground">
        Thanks for applying to <strong>{jobTitle}</strong>. Our team reviews every application
        within 2-3 business days. You can check your status anytime.
      </p>
      {applicationId && (
        <p className="text-muted-foreground" style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
          Your application ID:{" "}
          <strong className="status-mono">{applicationId}</strong>
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          href={
            applicationId && email
              ? `/check-status?applicationId=${encodeURIComponent(applicationId)}&email=${encodeURIComponent(email)}`
              : "/check-status"
          }
          className="btn btn-primary"
        >
          Check status
        </Link>
        <Link href="/jobs" className="btn btn-outline">
          Browse more roles
        </Link>
      </div>
    </div>
  );
}
