import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminToast } from "@/components/admin/AdminToast";
import { JobActions } from "@/components/jobs/admin/JobActions";
import { JobStatusBadge } from "@/components/jobs/admin/JobStatusBadge";
import { keywordsFromJson } from "@/validators/admin-job.schema";
import { formatDate, getJobTypeLabel } from "@/lib/utils/labels";
import { jobsService } from "@/services/jobs.service";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await jobsService.getJob(id);
  return { title: job ? job.title : "Job" };
}

export const dynamic = "force-dynamic";

export default async function AdminJobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = await jobsService.getJob(id);
  if (!job) notFound();

  const applicationsCount = await jobsService.countApplications(id);
  const isActive = job.isActive !== false;

  return (
    <>
      <Suspense fallback={null}>
        <AdminToast />
      </Suspense>

      <PageHeader
        title={job.title}
        description={`${job.department} · ${job.location}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Jobs", href: "/admin/jobs" },
          { label: job.title },
        ]}
        actions={
          <Link href={`/admin/jobs/${job.id}/edit`} className="btn btn-primary">
            Edit job
          </Link>
        }
      />

      <div className="admin-job-detail-meta">
        <JobStatusBadge isActive={isActive} />
        <span className="badge badge-gray">{getJobTypeLabel(job.jobType)}</span>
        <span className="text-sm text-muted-foreground">
          {applicationsCount} application{applicationsCount === 1 ? "" : "s"}
        </span>
        <span className="text-sm text-muted-foreground">
          Posted {formatDate(job.createdAt)}
        </span>
      </div>

      <div className="card mt-4">
        <JobActions
          jobId={job.id}
          isActive={isActive}
          applicationsCount={applicationsCount}
        />
      </div>

      <div className="admin-job-detail-grid mt-6">
        <section className="card">
          <h2>Description</h2>
          <p className="admin-prose">{job.description}</p>
        </section>
        <section className="card">
          <h2>Requirements</h2>
          <p className="admin-prose">{job.requirements}</p>
        </section>
        {job.keyResponsibilities ? (
          <section className="card">
            <h2>Responsibilities</h2>
            <p className="admin-prose">{job.keyResponsibilities}</p>
          </section>
        ) : null}
        {job.salaryOffered ? (
          <section className="card">
            <h2>Salary</h2>
            <p>{job.salaryOffered}</p>
          </section>
        ) : null}
        {job.screeningKeywords ? (
          <section className="card">
            <h2>Screening keywords</h2>
            <p>{keywordsFromJson(job.screeningKeywords)}</p>
          </section>
        ) : null}
      </div>
    </>
  );
}
