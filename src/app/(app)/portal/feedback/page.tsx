import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { FeedbackList } from "@/components/portal/FeedbackList";
import {
  portalService,
  requirePortalEmployee,
} from "@/services/portal.service";

export const metadata: Metadata = { title: "Feedback" };
export const dynamic = "force-dynamic";

export default async function PortalFeedbackPage() {
  const { employee } = await requirePortalEmployee();
  const items = await portalService.getFeedback(employee.id);

  return (
    <>
      <PageHeader
        title="Feedback"
        description="Share feedback with HR and track responses"
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Feedback" },
        ]}
      />
      <FeedbackList items={items} />
    </>
  );
}
