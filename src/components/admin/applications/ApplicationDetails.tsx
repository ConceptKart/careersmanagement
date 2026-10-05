import { ApplicationHeader } from "@/components/admin/applications/ApplicationHeader";
import { NotesEditor } from "@/components/admin/applications/NotesEditor";
import { ResumeCard } from "@/components/admin/applications/ResumeCard";
import { ScreeningCard } from "@/components/admin/applications/ScreeningCard";
import type { AdminApplicationDetail } from "@/repositories/applications.repository";

type Props = {
  application: AdminApplicationDetail;
  resumeAvailable?: boolean;
};

export function ApplicationDetails({ application, resumeAvailable = true }: Props) {
  return (
    <div className="admin-app-detail">
      <ApplicationHeader application={application} />

      <div className="admin-app-detail-grid">
        <section className="card">
          <h2>Candidate information</h2>
          <dl className="admin-dl">
            <div>
              <dt>Name</dt>
              <dd>{application.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{application.email ?? "—"}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{application.phone}</dd>
            </div>
            {application.linkedinUrl ? (
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  <a
                    href={application.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary"
                  >
                    {application.linkedinUrl}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="card">
          <h2>Application information</h2>
          <dl className="admin-dl">
            <div>
              <dt>Job</dt>
              <dd>{application.job.title}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{application.job.department}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{application.job.location}</dd>
            </div>
            <div>
              <dt>Application ID</dt>
              <dd className="font-mono text-sm">{application.id}</dd>
            </div>
          </dl>
        </section>

        <ScreeningCard application={application} />

        {application.coverLetter ? (
          <section className="card">
            <h2>Cover letter / extra details</h2>
            <div className="admin-prose cover-letter-box">{application.coverLetter}</div>
          </section>
        ) : null}

        <ResumeCard
          resumePath={application.resumePath}
          candidateName={application.name}
          resumeAvailable={resumeAvailable}
        />

        <NotesEditor
          applicationId={application.id}
          initialNotes={application.adminNotes ?? ""}
        />
      </div>
    </div>
  );
}
