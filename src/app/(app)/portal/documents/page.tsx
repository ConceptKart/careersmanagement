import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { DocumentsCard } from "@/components/portal/DocumentsCard";
import {
  portalService,
  requirePortalEmployee,
} from "@/services/portal.service";

export const metadata: Metadata = { title: "Documents" };
export const dynamic = "force-dynamic";

export default async function PortalDocumentsPage() {
  const { employee } = await requirePortalEmployee();
  const documents = await portalService.getDocuments(employee.id);

  return (
    <>
      <PageHeader
        title="Documents"
        description="Your employment documents"
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Documents" },
        ]}
      />
      <DocumentsCard documents={documents} />
    </>
  );
}
