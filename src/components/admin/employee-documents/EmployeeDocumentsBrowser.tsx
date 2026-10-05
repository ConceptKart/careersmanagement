"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteEmployeeDocumentAction } from "@/actions/admin-employees";
import { DeleteDialog } from "@/components/jobs/admin/DeleteDialog";
import type { AdminEmployeeDocument } from "@/repositories/employees.repository";
import { formatDate, formatINR, getDocumentTypeLabel } from "@/lib/utils/labels";

type DocRow = AdminEmployeeDocument & {
  employeeId: string;
  employeeName: string;
};

type Props = { documents: DocRow[] };

export function EmployeeDocumentsBrowser({ documents }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; id: string; docs: DocRow[] }>();
    for (const doc of documents) {
      const existing = map.get(doc.employeeId);
      if (existing) existing.docs.push(doc);
      else {
        map.set(doc.employeeId, {
          id: doc.employeeId,
          name: doc.employeeName,
          docs: [doc],
        });
      }
    }
    return Array.from(map.values());
  }, [documents]);

  if (documents.length === 0) {
    return (
      <div className="admin-empty-state">
        <p>No employee documents found.</p>
      </div>
    );
  }

  return (
    <>
      {grouped.map((group) => (
        <section key={group.id} className="mb-6">
          <h3 className="font-semibold mb-2">
            <Link href={`/admin/employees/${group.id}`} className="text-primary">
              {group.name}
            </Link>
          </h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {group.docs.map((doc) => {
                  const href = doc.filePath
                    ? `/api/admin/downloads?type=documents&file=${encodeURIComponent(doc.filePath)}`
                    : null;
                  return (
                    <tr key={doc.id}>
                      <td>{doc.title}</td>
                      <td>{getDocumentTypeLabel(doc.documentType)}</td>
                      <td>{doc.period ?? "—"}</td>
                      <td>{formatINR(doc.amount)}</td>
                      <td>{formatDate(doc.createdAt)}</td>
                      <td>
                        <div className="flex gap-2">
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
        </section>
      ))}

      <DeleteDialog
        open={deleteId !== null}
        title="Delete document"
        message="Remove this employee document record?"
        confirmLabel="Delete"
        destructive
        pending={pending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          startTransition(async () => {
            await deleteEmployeeDocumentAction(deleteId);
            setDeleteId(null);
            router.refresh();
          });
        }}
      />
    </>
  );
}
