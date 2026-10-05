import { getStatusLabel } from "@/lib/utils/labels";
import type { ApplicationStatus } from "@prisma/client";

type Props = {
  status: ApplicationStatus;
};

const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  new: "badge-blue",
  in_review: "badge-amber",
  shortlisted: "badge-violet",
  interview_scheduled: "badge-indigo",
  rejected: "badge-red",
  hired: "badge-emerald",
};

export function StatusBadge({ status }: Props) {
  return (
    <span className={`badge ${STATUS_BADGE_CLASS[status] ?? "badge-gray"}`}>
      {getStatusLabel(status)}
    </span>
  );
}
