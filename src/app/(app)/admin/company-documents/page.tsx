import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { CompanyDocFilters } from "@/components/admin/company-documents/CompanyDocFilters";
import { CompanyDocumentUpload } from "@/components/admin/company-documents/CompanyDocumentUpload";
import { CompanyDocumentsList } from "@/components/admin/company-documents/CompanyDocumentsList";
import { JobPagination } from "@/components/jobs/admin/JobPagination";
import { requireAdmin } from "@/lib/auth/guards";
import { companyDocumentsService } from "@/services/company-documents.service";
import { adminCompanyDocListFiltersSchema } from "@/validators/admin-company-document.schema";

export const metadata: Metadata = {
  title: "Company Documents",
  description: "Manage organization policies and documents.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCompanyDocumentsPage({ searchParams }: Props) {
  await requireAdmin();
  const raw = await searchParams;
  const parsed = adminCompanyDocListFiltersSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    type: typeof raw.type === "string" ? raw.type : "all",
    status: typeof raw.status === "string" ? raw.status : "all",
    page: typeof raw.page === "string" ? raw.page : "1",
  });
  const filters = parsed.success
    ? parsed.data
    : { q: "", type: "all" as const, status: "all" as const, page: 1 };

  const list = await companyDocumentsService.getDocuments(filters);

  return (
    <>
      <PageHeader
        title="Company Documents"
        description={`${list.total} document${list.total === 1 ? "" : "s"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Company Documents" },
        ]}
      />

      <Suspense fallback={<div className="admin-app-filters">Loading…</div>}>
        <CompanyDocFilters />
      </Suspense>

      <div className="card mt-6">
        <CompanyDocumentsList documents={list.documents} />
        <JobPagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          basePath="/admin/company-documents"
          itemLabel="document"
          searchParams={{
            q: filters.q || undefined,
            type: filters.type !== "all" ? filters.type : undefined,
            status: filters.status !== "all" ? filters.status : undefined,
          }}
        />
      </div>

      <CompanyDocumentUpload />
    </>
  );
}
