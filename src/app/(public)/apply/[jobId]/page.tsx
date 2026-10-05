import { notFound, redirect } from "next/navigation";
import { jobApplyPath } from "@/lib/utils/job-slug";
import { jobsService } from "@/services/jobs.service";

type Props = { params: Promise<{ jobId: string }> };

/** Legacy route — redirect to /jobs/[slug]/apply */
export default async function LegacyApplyPage({ params }: Props) {
  const { jobId } = await params;
  const job = await jobsService.getActiveById(jobId);
  if (!job) notFound();
  redirect(jobApplyPath(job));
}
