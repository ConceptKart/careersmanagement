export default function JobsLoading() {
  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "3rem" }}>
      <div className="page-header">
        <h1 className="page-title">Open Roles</h1>
        <p className="page-description">Loading open roles…</p>
      </div>
      <div className="job-grid" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="job-card"
            style={{ minHeight: 180, background: "var(--muted)", borderColor: "var(--border)" }}
          />
        ))}
      </div>
    </div>
  );
}
