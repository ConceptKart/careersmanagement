import type { TimelineStage } from "@/lib/utils/status-timeline";

type Props = {
  stages: TimelineStage[];
};

export function StatusTimeline({ stages }: Props) {
  return (
    <ol className="status-timeline" aria-label="Application progress">
      {stages.map((stage, index) => (
        <li
          key={stage.id}
          className={`status-timeline-item status-timeline-${stage.state}`}
        >
          <div className="status-timeline-marker" aria-hidden>
            {stage.state === "completed" && <span>✓</span>}
            {stage.state === "current" && <span aria-current="step">●</span>}
            {stage.state === "rejected" && <span>✕</span>}
            {stage.state === "upcoming" && <span>{index + 1}</span>}
          </div>
          <div className="status-timeline-content">
            <p className="status-timeline-label">{stage.label}</p>
            {stage.state === "current" && (
              <p className="status-timeline-current">Current stage</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
