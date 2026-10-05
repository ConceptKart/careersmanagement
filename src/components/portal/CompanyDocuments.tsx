import type { PortalCompanyDocument } from "@/repositories/portal.repository";
import { getCompanyDocLabel } from "@/lib/utils/labels";

type Props = {
  documents: PortalCompanyDocument[];
};

export function CompanyDocuments({ documents }: Props) {
  if (documents.length === 0) {
    return (
      <div className="card">
        <p className="text-sm text-muted-foreground">
          No company documents available.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {documents.map((doc) => {
        const href = doc.filePath
          ? `/api/portal/downloads?type=company-documents&file=${encodeURIComponent(doc.filePath)}`
          : null;
        return (
          <article key={doc.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {getCompanyDocLabel(doc.documentType)}
                  {doc.version ? ` · v${doc.version}` : ""}
                </p>
                <h3 className="font-semibold">{doc.title}</h3>
                {doc.description ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    {doc.description}
                  </p>
                ) : null}
              </div>
              {href ? (
                <a
                  href={href}
                  className="btn btn-outline btn-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
