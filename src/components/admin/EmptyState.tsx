type Props = {
  title?: string;
  message: string;
};

export function EmptyState({ title = "Nothing here yet", message }: Props) {
  return (
    <div className="admin-empty-state">
      <h3>{title}</h3>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
