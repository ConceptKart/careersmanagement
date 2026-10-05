import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { SalaryHistory } from "@/components/portal/SalaryHistory";
import {
  portalService,
  requirePortalEmployee,
} from "@/services/portal.service";

export const metadata: Metadata = { title: "Salary" };
export const dynamic = "force-dynamic";

export default async function PortalSalaryPage() {
  const { employee } = await requirePortalEmployee();
  const records = await portalService.getSalaryHistory(employee.id);

  return (
    <>
      <PageHeader
        title="Salary"
        description="Your recent salary history"
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Salary" },
        ]}
      />
      <SalaryHistory records={records} />
    </>
  );
}
