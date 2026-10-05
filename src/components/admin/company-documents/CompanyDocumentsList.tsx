"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteCompanyDocumentAction,
  toggleCompanyDocumentAction,
} from "@/actions/admin-company-documents";
import { DeleteDialog } from "@/components/jobs/admin/DeleteDialog";
import type { AdminCompanyDocListItem } from "@/repositories/company-documents.repository";
import { formatDate, getCompanyDocLabel } from "@/lib/utils/labels";

type Props = {
  documents: AdminCompanyDocListItem[];
};

export function CompanyDocumentsList({ documents }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <div className="admin-empty-state">
        <p>No company documents yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Version</th>
              <th>Effective</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const href = doc.filePath
                ? `/api/admin/downloads?type=company-documents&file=${encodeURIComponent(doc.filePath)}`
                : null;
              return (
                <tr key={doc.id}>
                  <td>
                    <div className="font-medium">{doc.title}</div>
                    {doc.description ? (
                      <div className="text-sm text-muted-foreground">
                        {doc.description}
                      </div>
                    ) : null}
                  </td>
                  <td>{getCompanyDocLabel(doc.documentType)}</td>
                  <td>{doc.version ?? "—"}</td>
                  <td>
                    {doc.effectiveDate ? formatDate(doc.effectiveDate) : "—"}
                  </td>
                  <td>
                    <span
                      className={
                        doc.isActive ? "badge badge-emerald" : "badge badge-gray"
                      }
                    >
                      {doc.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
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
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={pending}
                        onClick={() => {
                          startTransition(async () => {
                            await toggleCompanyDocumentAction(doc.id);
                            router.refresh();
                          });
                        }}
                      >
                        {doc.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={pending}
                        onClick={() => setDeleteId(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <DeleteDialog
        open={deleteId !== null}
        title="Delete document"
        message="Remove this company document? The database row will be deleted (PHP parity — file may remain on disk)."
        confirmLabel="Delete"
        destructive
        pending={pending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          startTransition(async () => {
            await deleteCompanyDocumentAction(deleteId);
            setDeleteId(null);
            router.refresh();
          });
        }}
      />
    </>
  );
}
