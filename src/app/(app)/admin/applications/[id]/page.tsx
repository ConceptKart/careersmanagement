import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ApplicationDetails } from "@/components/admin/applications/ApplicationDetails";
import { applicationsService } from "@/services/applications.service";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const app = await applicationsService.getApplication(id);
  return { title: app ? app.name : "Application" };
}

export const dynamic = "force-dynamic";

export default async function AdminApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const application = await applicationsService.getApplication(id);
  if (!application) notFound();

  return (
    <>
      <PageHeader
        title={application.name}
        description={application.job.title}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Applications", href: "/admin/applications" },
          { label: application.name },
        ]}
      />
      <ApplicationDetails
        application={application}
        resumeAvailable={await applicationsService.resumeFileExists(application.resumePath)}
      />
    </>
  );
}
