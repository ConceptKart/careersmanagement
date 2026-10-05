"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleJobStatusAction } from "@/actions/admin-jobs";

type Props = {
  jobId: string;
  isActive: boolean;
};

export function PublishToggle({ jobId, isActive }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="switch" title={isActive ? "Unpublish" : "Publish"}>
      <input
        type="checkbox"
        checked={isActive}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.checked;
          startTransition(async () => {
            await toggleJobStatusAction(jobId, next);
            router.refresh();
          });
        }}
      />
      <span className="switch-slider" />
    </label>
  );
}
