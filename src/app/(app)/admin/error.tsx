"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: Props) {
  return (
    <div className="card admin-error" role="alert">
      <h1>Something went wrong</h1>
      <p className="text-muted-foreground mt-2">
        The admin dashboard could not be loaded. Please try again.
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
