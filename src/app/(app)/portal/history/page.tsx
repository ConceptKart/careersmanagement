import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatDate } from "@/lib/utils/labels";
import { requirePortalEmployee } from "@/services/portal.service";

export const metadata: Metadata = { title: "History" };
export const dynamic = "force-dynamic";

/** PHP portal/history.php — employment timeline from employee record. */
export default async function PortalHistoryPage() {
  const { employee } = await requirePortalEmployee();

  return (
    <>
      <PageHeader
        title="Employment history"
        description="Your role timeline"
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "History" },
        ]}
      />
      <div className="card">
        <article>
          <h3 className="font-semibold">{employee.position}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {employee.department}
          </p>
          <p className="text-sm mt-2">
            {formatDate(employee.dateOfJoining)}
            {" — "}
            {employee.dateOfExit ? formatDate(employee.dateOfExit) : "Present"}
          </p>
        </article>
      </div>
    </>
  );
}
