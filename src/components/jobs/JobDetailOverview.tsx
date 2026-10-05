import {
  extractBenefits,
  formatJobText,
  parseScreeningKeywords,
} from "@/lib/utils/job-content";
import type { JobDetail } from "@/repositories/jobs.repository";

type Props = {
  job: JobDetail;
};

export function JobDetailOverview({ job }: Props) {
  const skills = parseScreeningKeywords(job.screeningKeywords);
  const benefits = extractBenefits(job.description);

  return (
    <div className="job-detail-overview">
      <OverviewSection title="Job Description" id="job-description">
        <TextBlock text={job.description} />
      </OverviewSection>

      {job.keyResponsibilities && (
        <OverviewSection title="Key Responsibilities" id="key-responsibilities">
          <TextBlock text={job.keyResponsibilities} />
        </OverviewSection>
      )}

      {job.requirements && (
        <OverviewSection title="Requirements" id="requirements">
          <TextBlock text={job.requirements} />
        </OverviewSection>
      )}

      {skills.length > 0 && (
        <OverviewSection title="Skills" id="skills">
          <ul className="job-skills-list">
            {skills.map((skill) => (
              <li key={skill}>
                <span className="job-skill-pill">{skill}</span>
              </li>
            ))}
          </ul>
        </OverviewSection>
      )}

      {benefits && (
        <OverviewSection title="Benefits" id="benefits">
          <TextBlock text={benefits} />
        </OverviewSection>
      )}
    </div>
  );
}

function OverviewSection({
  title,
  id,
  children,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section className="job-overview-section" aria-labelledby={id}>
      <h2 id={id} className="job-overview-heading">
        {title}
      </h2>
      <div className="job-overview-body">{children}</div>
    </section>
  );
}

function TextBlock({ text }: { text: string }) {
  return (
    <div className="job-text-block">{formatJobText(text)}</div>
  );
}
