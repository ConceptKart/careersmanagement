"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteJobAction,
  duplicateJobAction,
  toggleJobStatusAction,
} from "@/actions/admin-jobs";
import { DeleteDialog } from "@/components/jobs/admin/DeleteDialog";

type Props = {
  jobId: string;
  isActive: boolean;
  applicationsCount: number;
  compact?: boolean;
};

export function JobActions({
  jobId,
  isActive,
  applicationsCount,
  compact = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = applicationsCount === 0;

  return (
    <div className={`admin-job-actions${compact ? " compact" : ""}`}>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <Link href={`/admin/jobs/${jobId}`} className="btn btn-secondary btn-sm">
        View
      </Link>
      <Link href={`/admin/jobs/${jobId}/edit`} className="btn btn-outline btn-sm">
        Edit
      </Link>

      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await toggleJobStatusAction(jobId, !isActive);
            if (!result.ok) setError(result.message ?? "Failed to update status.");
            router.refresh();
          });
        }}
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>

      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await duplicateJobAction(jobId);
            if (!result.ok) {
              setError(result.message ?? "Duplicate failed.");
              return;
            }
            if (result.newId) {
              router.push(`/admin/jobs/${result.newId}/edit?toast=duplicated`);
            } else {
              router.refresh();
            }
          });
        }}
      >
        Duplicate
      </button>

      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          setDeleteOpen(true);
        }}
      >
        {canDelete ? "Delete" : "Archive"}
      </button>

      <DeleteDialog
        open={deleteOpen}
        title={canDelete ? "Delete job?" : "Cannot delete job"}
        message={
          canDelete
            ? "This permanently removes the job posting. This cannot be undone."
            : `This job has ${applicationsCount} application(s). Delete is blocked — deactivate (archive) instead to hide it from candidates.`
        }
        confirmLabel={canDelete ? "Delete" : "Deactivate instead"}
        destructive={canDelete}
        pending={pending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          startTransition(async () => {
            if (canDelete) {
              const result = await deleteJobAction(jobId);
              setDeleteOpen(false);
              if (!result.ok) {
                setError(result.message ?? "Delete failed.");
                return;
              }
              router.push("/admin/jobs?toast=deleted");
              router.refresh();
              return;
            }
            await toggleJobStatusAction(jobId, false);
            setDeleteOpen(false);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
