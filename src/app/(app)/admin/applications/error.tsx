"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminApplicationsError({ error, reset }: Props) {
  return (
    <div className="card admin-error" role="alert">
      <h1>Could not load applications</h1>
      <p className="text-muted-foreground mt-2">
        Something went wrong while loading applications. Please try again.
      </p>
      {error.digest ? (
        <p className="text-sm text-muted-foreground mt-2">Error ID: {error.digest}</p>
      ) : null}
      <button type="button" className="btn btn-primary mt-4" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
