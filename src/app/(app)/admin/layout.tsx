import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: {
    default: "Admin — Concept Kart Careers",
    template: "%s — Admin | Concept Kart Careers",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AdminShell email={session.user.email} roles={session.user.roles ?? []}>
      {children}
    </AdminShell>
  );
}
