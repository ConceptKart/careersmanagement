import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProfileCard } from "@/components/portal/ProfileCard";
import { requirePortalEmployee } from "@/services/portal.service";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function PortalProfilePage() {
  const { employee } = await requirePortalEmployee();

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your personal and employment details"
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Profile" },
        ]}
      />
      <ProfileCard employee={employee} />
    </>
  );
}
