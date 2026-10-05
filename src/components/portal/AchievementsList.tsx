import type { PortalAchievement } from "@/repositories/portal.repository";
import { formatDate } from "@/lib/utils/labels";

type Props = {
  achievements: PortalAchievement[];
};

export function AchievementsList({ achievements }: Props) {
  if (achievements.length === 0) {
    return (
      <div className="card">
        <p className="text-sm text-muted-foreground">No achievements yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {achievements.map((item) => (
        <article key={item.id} className="card">
          <h3 className="font-semibold">{item.title}</h3>
          {item.description ? (
            <p className="text-sm mt-2 whitespace-pre-wrap">{item.description}</p>
          ) : null}
          <p className="text-sm text-muted-foreground mt-2">
            Achieved on {formatDate(item.achievedOn)}
          </p>
        </article>
      ))}
    </div>
  );
}
