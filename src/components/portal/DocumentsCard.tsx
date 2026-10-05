import type { PortalDocument } from "@/repositories/portal.repository";
import { formatDate, getDocumentTypeLabel } from "@/lib/utils/labels";

type Props = {
  documents: PortalDocument[];
};

export function DocumentsCard({ documents }: Props) {
  if (documents.length === 0) {
    return (
      <div className="card">
        <p className="text-sm text-muted-foreground">
          No documents available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Period</th>
              <th>Uploaded</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const href = doc.filePath
                ? `/api/portal/downloads?type=documents&file=${encodeURIComponent(doc.filePath)}`
                : null;
              const ext = doc.filePath?.split(".").pop()?.toLowerCase() ?? "";
              const canPreview = ext === "pdf" || ext === "png" || ext === "jpg" || ext === "jpeg";
              return (
                <tr key={doc.id}>
                  <td className="font-medium">{doc.title}</td>
                  <td>{getDocumentTypeLabel(doc.documentType)}</td>
                  <td>{doc.period ?? "—"}</td>
                  <td>{formatDate(doc.createdAt)}</td>
                  <td>
                    {href ? (
                      <div className="flex gap-2">
                        <a
                          href={href}
                          className="btn btn-outline btn-sm"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {canPreview ? "Preview" : "View"}
                        </a>
                        <a
                          href={`${href}&download=1`}
                          className="btn btn-secondary btn-sm"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
