import { formatDate, formatDateTime } from "@/lib/utils/labels";
import { maskEmail } from "@/lib/utils/mask-email";
import {
  buildStatusTimeline,
  getNextSteps,
} from "@/lib/utils/status-timeline";
import type { ApplicationStatusDetail } from "@/repositories/applications.repository";
import { StatusBadge } from "@/components/status/StatusBadge";
import { StatusTimeline } from "@/components/status/StatusTimeline";

type Props = {
  application: ApplicationStatusDetail;
};

export function StatusCard({ application }: Props) {
  const stages = buildStatusTimeline(application.status);
  const nextSteps = getNextSteps(application.status);
  const showInterviewDate = application.status === "interview_scheduled";
  const recruiterNotes = application.screeningSummary?.trim() || null;

  return (
    <div className="status-result">
      <div className="status-card">
        <div className="status-card-header">
          <h2 className="status-card-title">Application Status</h2>
          <StatusBadge status={application.status} />
        </div>

        <section className="status-section" aria-labelledby="job-info-heading">
          <h3 id="job-info-heading" className="status-section-title">
            Job Information
          </h3>
          <dl className="status-facts">
            <Fact label="Job Title" value={application.job.title} />
            <Fact label="Department" value={application.job.department} />
            <Fact label="Location" value={application.job.location} />
          </dl>
        </section>

        <section className="status-section" aria-labelledby="application-info-heading">
          <h3 id="application-info-heading" className="status-section-title">
            Application Information
          </h3>
          <dl className="status-facts">
            <Fact label="Application ID" value={application.id} mono />
            <Fact label="Applied Date" value={formatDate(application.createdAt)} />
            <Fact label="Current Status" value={<StatusBadge status={application.status} />} />
          </dl>
        </section>

        <section className="status-section" aria-labelledby="candidate-info-heading">
          <h3 id="candidate-info-heading" className="status-section-title">
            Candidate Information
          </h3>
          <dl className="status-facts">
            <Fact label="Name" value={application.name} />
            <Fact label="Email" value={maskEmail(application.email)} />
          </dl>
        </section>

        {(recruiterNotes || showInterviewDate || nextSteps) && (
          <section className="status-section" aria-labelledby="optional-details-heading">
            <h3 id="optional-details-heading" className="status-section-title">
              Additional Details
            </h3>
            <dl className="status-facts">
              {recruiterNotes && <Fact label="Recruiter Notes" value={recruiterNotes} />}
              {showInterviewDate && (
                <Fact
                  label="Interview Date"
                  value={formatDateTime(application.updatedAt)}
                />
              )}
              {nextSteps && <Fact label="Next Steps" value={nextSteps} />}
            </dl>
          </section>
        )}
      </div>

      <div className="status-card status-timeline-card">
        <h3 className="status-section-title">Status Timeline</h3>
        <StatusTimeline stages={stages} />
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="status-fact">
      <dt>{label}</dt>
      <dd className={mono ? "status-mono" : undefined}>{value}</dd>
    </div>
  );
}
