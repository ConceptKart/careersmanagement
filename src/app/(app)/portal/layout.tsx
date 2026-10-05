import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/PortalShell";
import { requireAuth } from "@/lib/auth/guards";
import { portalService } from "@/services/portal.service";

export const metadata: Metadata = {
  title: {
    default: "My Portal — Concept Kart Careers",
    template: "%s — Portal | Concept Kart Careers",
  },
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const employee = await portalService.getEmployeeProfile(session.user.id);

  return (
    <PortalShell
      email={session.user.email}
      roles={session.user.roles ?? []}
      fullName={employee?.fullName}
    >
      {children}
    </PortalShell>
  );
}
