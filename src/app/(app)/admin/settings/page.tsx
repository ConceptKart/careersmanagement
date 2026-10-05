import type { Metadata } from "next";
import { AdminComingSoon } from "@/components/admin/AdminComingSoon";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <AdminComingSoon
      title="Settings"
      description="Admin preferences and system configuration."
    />
  );
}
