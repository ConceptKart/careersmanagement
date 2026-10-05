"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { ApplicationStatus } from "@prisma/client";
import { updateApplicationStatusAction } from "@/actions/admin-applications";
import { DeleteDialog } from "@/components/jobs/admin/DeleteDialog";
import { getStatusLabel } from "@/lib/utils/labels";

const STATUSES: ApplicationStatus[] = [
  "new",
  "in_review",
  "shortlisted",
  "interview_scheduled",
  "rejected",
  "hired",
];

type Props = {
  applicationId: string;
  status: ApplicationStatus;
  compact?: boolean;
};

export function StatusSelect({ applicationId, status, compact }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(status);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(status);
  }, [status]);

  function applyStatus(next: ApplicationStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateApplicationStatusAction(applicationId, next);
      if (result.ok) {
        setValue(next);
        router.refresh();
      } else {
        setValue(status);
        setError(result.message ?? "Could not update status.");
      }
      setPendingStatus(null);
    });
  }

  function cancelConfirm() {
    setPendingStatus(null);
    setValue(status);
  }

  return (
    <>
      <select
        key={value}
        className="form-input form-select"
        style={compact ? { width: "10rem", padding: "0.375rem" } : undefined}
        value={value}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value as ApplicationStatus;
          if (next === "rejected" || next === "hired") {
            setPendingStatus(next);
            return;
          }
          applyStatus(next);
        }}
        aria-label="Application status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {getStatusLabel(s)}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-sm text-destructive mt-1" role="alert">
          {error}
        </p>
      ) : null}

      <DeleteDialog
        open={pendingStatus !== null}
        title="Confirm status change"
        message={
          pendingStatus
            ? `Set this application to “${getStatusLabel(pendingStatus)}”?`
            : ""
        }
        confirmLabel="Update status"
        destructive={pendingStatus === "rejected"}
        pending={pending}
        onCancel={cancelConfirm}
        onConfirm={() => {
          if (pendingStatus) applyStatus(pendingStatus);
        }}
      />
    </>
  );
}
