"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicError({ error, reset }: Props) {
  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "3rem" }}>
      <div className="page-header">
        <h1 className="page-title">Something went wrong</h1>
        <p className="page-description">
          We could not load this page. Please try again.
        </p>
      </div>
      {error.digest ? (
        <p className="text-sm text-muted-foreground mb-4">Error ID: {error.digest}</p>
      ) : null}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
