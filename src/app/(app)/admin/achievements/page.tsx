import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AchievementFilters } from "@/components/admin/achievements/AchievementFilters";
import { AchievementsTable } from "@/components/admin/achievements/AchievementsTable";
import { JobPagination } from "@/components/jobs/admin/JobPagination";
import { requireAdmin } from "@/lib/auth/guards";
import { achievementsService } from "@/services/achievements.service";
import { adminAchievementListFiltersSchema } from "@/validators/admin-achievement.schema";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Recognize employee achievements.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminAchievementsPage({ searchParams }: Props) {
  await requireAdmin();
  const raw = await searchParams;
  const parsed = adminAchievementListFiltersSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    employeeId: typeof raw.employeeId === "string" ? raw.employeeId : "",
    page: typeof raw.page === "string" ? raw.page : "1",
  });
  const filters = parsed.success
    ? parsed.data
    : { q: "", employeeId: "", page: 1 };

  const [list, employees] = await Promise.all([
    achievementsService.getAchievements(filters),
    achievementsService.listEmployeeOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Achievements"
        description={`${list.total} achievement${list.total === 1 ? "" : "s"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Achievements" },
        ]}
        actions={
          <Link href="/admin/achievements/new" className="btn btn-primary btn-sm">
            Add achievement
          </Link>
        }
      />

      <Suspense fallback={<div className="admin-app-filters">Loading…</div>}>
        <AchievementFilters employees={employees} />
      </Suspense>

      <div className="card mt-6">
        <AchievementsTable achievements={list.achievements} />
        <JobPagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          basePath="/admin/achievements"
          itemLabel="achievement"
          searchParams={{
            q: filters.q || undefined,
            employeeId: filters.employeeId || undefined,
          }}
        />
      </div>
    </>
  );
}
