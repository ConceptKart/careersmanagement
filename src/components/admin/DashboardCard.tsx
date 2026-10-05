type Props = {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
};

export function DashboardCard({ label, value, icon }: Props) {
  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <span className="stats-card-label">{label}</span>
        {icon}
      </div>
      <div className="stats-card-value">{value}</div>
    </div>
  );
}
