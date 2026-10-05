import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { FeedbackFilters } from "@/components/admin/feedback/FeedbackFilters";
import { FeedbackList } from "@/components/admin/feedback/FeedbackList";
import { JobPagination } from "@/components/jobs/admin/JobPagination";
import { requireAdmin } from "@/lib/auth/guards";
import { feedbackService } from "@/services/feedback.service";
import { adminFeedbackListFiltersSchema } from "@/validators/admin-feedback.schema";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Review and respond to employee feedback.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminFeedbackPage({ searchParams }: Props) {
  await requireAdmin();
  const raw = await searchParams;
  const parsed = adminFeedbackListFiltersSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    status: typeof raw.status === "string" ? raw.status : "open",
    page: typeof raw.page === "string" ? raw.page : "1",
  });
  const filters = parsed.success
    ? parsed.data
    : { q: "", status: "open" as const, page: 1 };

  const list = await feedbackService.getFeedback(filters);

  return (
    <>
      <PageHeader
        title="Feedback"
        description={`${list.total} item${list.total === 1 ? "" : "s"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Feedback" },
        ]}
      />

      <Suspense fallback={<div className="admin-app-filters">Loading…</div>}>
        <FeedbackFilters />
      </Suspense>

      <div className="mt-6">
        <FeedbackList items={list.feedback} />
        <div className="card mt-4">
          <JobPagination
            page={list.page}
            totalPages={list.totalPages}
            total={list.total}
            basePath="/admin/feedback"
            itemLabel="item"
            searchParams={{
              q: filters.q || undefined,
              status: filters.status !== "open" ? filters.status : undefined,
            }}
          />
        </div>
      </div>
    </>
  );
}
