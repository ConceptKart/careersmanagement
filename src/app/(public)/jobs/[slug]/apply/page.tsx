import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { submitApplicationAction } from "@/actions/submit-application";
import { ApplicationForm } from "@/components/application/ApplicationForm";
import { jobDetailPath } from "@/lib/utils/job-slug";
import { jobsService } from "@/services/jobs.service";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const job = await jobsService.getBySlug(slug);
    return { title: job ? `Apply — ${job.title}` : "Apply | Careers" };
  } catch {
    return { title: "Apply | Careers" };
  }
}

/**
 * Phase 2A — Job application flow.
 * PHP reference (apply.php): active job required, multipart form, success state.
 */
export default async function JobApplyPage({ params }: Props) {
  const { slug } = await params;
  const job = await jobsService.getBySlug(slug);

  if (!job || !job.isActive) notFound();

  return (
    <section className="section-sm application-page">
      <div className="container max-w-2xl">
        <Link href={jobDetailPath(job)} className="back-link application-back">
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
          Back to role
        </Link>

        <h1 className="application-title">Apply</h1>
        <p className="application-subtitle">
          Applying for <strong>{job.title}</strong>
        </p>

        <ApplicationForm
          jobId={job.id}
          jobTitle={job.title}
          submitAction={submitApplicationAction}
        />
      </div>
    </section>
  );
}
