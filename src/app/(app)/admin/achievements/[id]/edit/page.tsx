import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateAchievementAction } from "@/actions/admin-achievements";
import { PageHeader } from "@/components/admin/PageHeader";
import { AchievementForm } from "@/components/admin/achievements/AchievementForm";
import { requireAdmin } from "@/lib/auth/guards";
import { toDateInputValue } from "@/lib/utils/labels";
import { achievementsService } from "@/services/achievements.service";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await achievementsService.getAchievement(id);
  return { title: item ? `Edit ${item.title}` : "Edit Achievement" };
}

export const dynamic = "force-dynamic";

export default async function AdminEditAchievementPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const [item, employees] = await Promise.all([
    achievementsService.getAchievement(id),
    achievementsService.listEmployeeOptions(),
  ]);
  if (!item) notFound();

  const submitAction = updateAchievementAction.bind(null, id);

  return (
    <>
      <PageHeader
        title={`Edit ${item.title}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Achievements", href: "/admin/achievements" },
          { label: "Edit" },
        ]}
      />
      <div className="card admin-job-form-card">
        <AchievementForm
          mode="edit"
          employees={employees}
          cancelHref="/admin/achievements"
          submitAction={submitAction}
          defaultValues={{
            employeeId: item.employeeId,
            title: item.title,
            description: item.description ?? undefined,
            achievedOn: toDateInputValue(item.achievedOn),
          }}
        />
      </div>
    </>
  );
}
