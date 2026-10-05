import Link from "next/link";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "403 — Unauthorized",
};

export default async function UnauthorizedPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="auth-status-page">
      <div className="auth-status-card">
        <p className="auth-status-code">403</p>
        <h1>Access denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <div className="auth-status-actions">
          <Link href="/" className="btn btn-primary">
            Return Home
          </Link>
          {isAuthenticated ? (
            <Link href="/portal" className="btn btn-secondary">
              Go to Portal
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
