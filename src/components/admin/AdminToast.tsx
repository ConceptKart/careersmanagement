"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TOAST_MESSAGES: Record<string, string> = {
  created: "Job created successfully.",
  updated: "Job updated successfully.",
  deleted: "Job deleted.",
  duplicated: "Job duplicated as an inactive draft.",
};

export function AdminToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = searchParams.get("toast");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toast || !TOAST_MESSAGES[toast]) return;
    setMessage(TOAST_MESSAGES[toast]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toast, pathname, router, searchParams]);

  if (!message) return null;

  return (
    <div className="admin-toast" role="status">
      {message}
    </div>
  );
}
