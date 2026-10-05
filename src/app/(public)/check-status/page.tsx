import type { Metadata } from "next";
import { checkApplicationStatusAction } from "@/actions/check-application-status";
import { EmptyState } from "@/components/status/EmptyState";
import { StatusCard } from "@/components/status/StatusCard";
import { StatusSearchForm } from "@/components/status/StatusSearchForm";
import { statusService } from "@/services/status.service";
import { checkStatusLookupSchema } from "@/validators/status.schema";

export const metadata: Metadata = {
  title: "Check Application Status | Careers",
  description:
    "Look up your job application status using your application ID and the email you used when applying.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Phase 3 — Application status tracking.
 * PHP reference (check-status.php): lookup by credentials, show status.
 * Security: requires both application ID and email; generic not-found message.
 */
export default async function CheckStatusPage({ searchParams }: Props) {
  const raw = await searchParams;
  const applicationId = typeof raw.applicationId === "string" ? raw.applicationId : "";
  const email = typeof raw.email === "string" ? raw.email : "";
  const hasQuery = applicationId.length > 0 || email.length > 0;

  let serverApplication = null;
  let notFound = false;
  let validationErrors: Record<string, string> | undefined;

  if (hasQuery) {
    const parsed = checkStatusLookupSchema.safeParse({ applicationId, email });
    if (!parsed.success) {
      validationErrors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!validationErrors[key]) validationErrors[key] = issue.message;
      }
    } else {
      const result = await statusService.lookup(parsed.data);
      if (result.ok) {
        serverApplication = result.application;
      } else if (result.reason === "not_found") {
        notFound = true;
      } else {
        validationErrors = result.fieldErrors;
      }
    }
  }

  return (
    <section className="section-sm status-page">
      <div className="container max-w-2xl">
        <h1 className="status-page-title">Check application status</h1>
        <p className="status-page-description">
          Enter your application ID and the email address you used when applying.
        </p>

        <StatusSearchForm
          checkStatusAction={checkApplicationStatusAction}
          initialApplicationId={applicationId}
          initialEmail={email}
        />

        {validationErrors && (
          <div className="status-search-alert" role="alert">
            Please correct the errors in the form above.
          </div>
        )}

        {notFound && (
          <EmptyState message="Application not found. Check your application ID and email, then try again." />
        )}

        {serverApplication && <StatusCard application={serverApplication} />}
      </div>
    </section>
  );
}
