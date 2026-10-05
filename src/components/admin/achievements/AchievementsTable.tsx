"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAchievementAction } from "@/actions/admin-achievements";
import { DeleteDialog } from "@/components/jobs/admin/DeleteDialog";
import type { AdminAchievementListItem } from "@/repositories/achievements.repository";
import { formatDate } from "@/lib/utils/labels";

type Props = { achievements: AdminAchievementListItem[] };

export function AchievementsTable({ achievements }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (achievements.length === 0) {
    return (
      <div className="admin-empty-state">
        <p>No achievements yet.</p>
        <Link href="/admin/achievements/new" className="btn btn-primary btn-sm mt-3">
          Add achievement
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Title</th>
              <th>Achieved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {achievements.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link
                    href={`/admin/employees/${row.employeeId}`}
                    className="text-primary"
                  >
                    {row.employeeName}
                  </Link>
                </td>
                <td>
                  <div className="font-medium">{row.title}</div>
                  {row.description ? (
                    <div className="text-sm text-muted-foreground">
                      {row.description}
                    </div>
                  ) : null}
                </td>
                <td>{formatDate(row.achievedOn)}</td>
                <td>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/achievements/${row.id}/edit`}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={pending}
                      onClick={() => setDeleteId(row.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteDialog
        open={deleteId !== null}
        title="Delete achievement"
        message="Remove this achievement record?"
        confirmLabel="Delete"
        destructive
        pending={pending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          startTransition(async () => {
            await deleteAchievementAction(deleteId);
            setDeleteId(null);
            router.refresh();
          });
        }}
      />
    </>
  );
}
