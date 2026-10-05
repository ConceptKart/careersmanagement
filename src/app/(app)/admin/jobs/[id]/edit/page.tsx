import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { updateJobAction } from "@/actions/admin-jobs";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminToast } from "@/components/admin/AdminToast";
import { JobForm } from "@/components/jobs/admin/JobForm";
import { keywordsFromJson, toPrismaJobType } from "@/validators/admin-job.schema";
import { jobsService } from "@/services/jobs.service";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await jobsService.getJob(id);
  return { title: job ? `Edit — ${job.title}` : "Edit Job" };
}

export const dynamic = "force-dynamic";

export default async function AdminEditJobPage({ params }: Props) {
  const { id } = await params;
  const job = await jobsService.getJob(id);
  if (!job) notFound();

  const boundUpdate = updateJobAction.bind(null, id);

  return (
    <>
      <Suspense fallback={null}>
        <AdminToast />
      </Suspense>

      <PageHeader
        title="Edit job"
        description={job.title}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Jobs", href: "/admin/jobs" },
          { label: job.title, href: `/admin/jobs/${job.id}` },
          { label: "Edit" },
        ]}
      />

      <div className="card admin-job-form-card">
        <JobForm
          mode="edit"
          cancelHref={`/admin/jobs/${job.id}`}
          submitAction={boundUpdate}
          defaultValues={{
            title: job.title,
            department: job.department,
            location: job.location,
            jobType: toPrismaJobType(job.jobType),
            description: job.description,
            requirements: job.requirements,
            keyResponsibilities: job.keyResponsibilities ?? "",
            salaryOffered: job.salaryOffered ?? "",
            screeningKeywords: keywordsFromJson(job.screeningKeywords),
            isActive: job.isActive !== false,
          }}
        />
      </div>
    </>
  );
}
