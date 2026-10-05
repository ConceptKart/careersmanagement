import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { CompanyDocuments } from "@/components/portal/CompanyDocuments";
import { requireAuth } from "@/lib/auth/guards";
import { portalService } from "@/services/portal.service";

export const metadata: Metadata = { title: "Company Documents" };
export const dynamic = "force-dynamic";

export default async function PortalCompanyDocumentsPage() {
  // PHP: any authenticated user; no employee row required
  await requireAuth();
  const documents = await portalService.getCompanyDocuments();

  return (
    <>
      <PageHeader
        title="Company Documents"
        description="Policies, handbook, and org chart"
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Company Docs" },
        ]}
      />
      <CompanyDocuments documents={documents} />
    </>
  );
}
