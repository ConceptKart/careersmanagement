import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { AchievementsList } from "@/components/portal/AchievementsList";
import {
  portalService,
  requirePortalEmployee,
} from "@/services/portal.service";

export const metadata: Metadata = { title: "Achievements" };
export const dynamic = "force-dynamic";

export default async function PortalAchievementsPage() {
  const { employee } = await requirePortalEmployee();
  const achievements = await portalService.getAchievements(employee.id);

  return (
    <>
      <PageHeader
        title="Achievements"
        description="Recognition and milestones"
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Achievements" },
        ]}
      />
      <AchievementsList achievements={achievements} />
    </>
  );
}
