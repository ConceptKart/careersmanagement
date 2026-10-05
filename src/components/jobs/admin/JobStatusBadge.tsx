type Props = {
  isActive: boolean | null | undefined;
};

export function JobStatusBadge({ isActive }: Props) {
  const active = isActive !== false;
  return (
    <span className={`badge ${active ? "badge-emerald" : "badge-gray"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}
