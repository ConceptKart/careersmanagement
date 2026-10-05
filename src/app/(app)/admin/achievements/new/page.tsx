import type { Metadata } from "next";
import { createAchievementAction } from "@/actions/admin-achievements";
import { PageHeader } from "@/components/admin/PageHeader";
import { AchievementForm } from "@/components/admin/achievements/AchievementForm";
import { requireAdmin } from "@/lib/auth/guards";
import { achievementsService } from "@/services/achievements.service";

export const metadata: Metadata = { title: "New Achievement" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminNewAchievementPage({ searchParams }: Props) {
  await requireAdmin();
  const raw = await searchParams;
  const employeeId =
    typeof raw.employeeId === "string" ? raw.employeeId : "";
  const employees = await achievementsService.listEmployeeOptions();

  return (
    <>
      <PageHeader
        title="Add achievement"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Achievements", href: "/admin/achievements" },
          { label: "New" },
        ]}
      />
      <div className="card admin-job-form-card">
        <AchievementForm
          mode="create"
          employees={employees}
          cancelHref="/admin/achievements"
          submitAction={createAchievementAction}
          defaultValues={{
            employeeId,
            title: "",
            description: undefined,
            achievedOn: "",
          }}
        />
      </div>
    </>
  );
}
