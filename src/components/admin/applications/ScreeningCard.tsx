import { formatDateTime } from "@/lib/utils/labels";
import type { AdminApplicationDetail } from "@/repositories/applications.repository";

type Props = {
  application: AdminApplicationDetail;
};

function parseKeywords(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function ScreeningCard({ application }: Props) {
  const matched = parseKeywords(application.screeningMatchedKeywords);
  const missing = parseKeywords(application.screeningMissingKeywords);
  const hasScreening =
    application.screeningScore !== null ||
    application.screeningSummary ||
    matched.length > 0 ||
    missing.length > 0;

  if (!hasScreening) {
    return (
      <section className="card">
        <h2>AI Screening</h2>
        <p className="text-sm text-muted-foreground">Not scored yet.</p>
        {application.screeningError ? (
          <p className="form-error mt-2">{application.screeningError}</p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="card">
      <h2>AI Screening</h2>
      <div className="score-summary">
        <div className="admin-screening-meta">
          {application.screeningScore !== null ? (
            <span
              className={`score-badge ${
                application.screeningPriority === "high"
                  ? "score-high"
                  : application.screeningPriority === "medium"
                    ? "score-medium"
                    : "score-low"
              }`}
            >
              {application.screeningScore}/100 · {application.screeningPriority ?? "low"}
            </span>
          ) : null}
          {application.screeningScoredAt ? (
            <span className="text-xs text-muted-foreground">
              Scored {formatDateTime(application.screeningScoredAt)}
            </span>
          ) : null}
        </div>

        {application.screeningSummary ? (
          <p className="text-sm mt-3">{application.screeningSummary}</p>
        ) : null}

        {matched.length > 0 ? (
          <div className="mt-3">
            <div className="text-xs uppercase text-muted-foreground mb-1">Matched</div>
            <div className="score-keywords">
              {matched.map((k) => (
                <span key={k} className="keyword-tag keyword-match">
                  {k}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {missing.length > 0 ? (
          <div className="mt-3">
            <div className="text-xs uppercase text-muted-foreground mb-1">Missing</div>
            <div className="score-keywords">
              {missing.map((k) => (
                <span key={k} className="keyword-tag keyword-missing">
                  {k}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
