import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JobDetailHero } from "@/components/jobs/JobDetailHero";
import { JobDetailOverview } from "@/components/jobs/JobDetailOverview";
import { JobDetailSidebar } from "@/components/jobs/JobDetailSidebar";
import { RelatedJobs } from "@/components/jobs/RelatedJobs";
import { shortDescription } from "@/lib/utils/job-display";
import { jobsService } from "@/services/jobs.service";

type Props = { params: Promise<{ slug: string }> };

/** Revalidate detail pages every 60s. */
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const job = await jobsService.getBySlug(slug);
    if (!job) return { title: "Job not found | Careers" };
    return {
      title: `${job.title} | Careers`,
      description: shortDescription(job.description, 150),
    };
  } catch {
    return { title: "Careers" };
  }
}

/**
 * Phase 1C — Job details.
 * PHP reference (jobs-view.php): load by id, show sections, apply CTA.
 * Route uses SEO slug `{title}-{uuid}`; bare uuid still resolves.
 */
export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await jobsService.getBySlug(slug);
  if (!job) notFound();

  const relatedJobs = await jobsService.getRelatedJobs(job.id, job.department);

  return (
    <section className="section-sm job-detail-page">
      <div className="container job-detail-container">
        <nav aria-label="Breadcrumb">
          <Link href="/jobs" className="back-link job-detail-back">
            <BackIcon />
            Back to Jobs
          </Link>
        </nav>

        <JobDetailHero job={job} />

        <div className="job-detail-layout">
          <JobDetailOverview job={job} />
          <JobDetailSidebar job={job} />
        </div>

        <RelatedJobs jobs={relatedJobs} />
      </div>
    </section>
  );
}

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
