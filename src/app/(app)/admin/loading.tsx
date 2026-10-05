export default function AdminDashboardLoading() {
  return (
    <div className="admin-loading" aria-busy="true" aria-label="Loading dashboard">
      <div className="admin-loading-header">
        <div className="admin-skeleton admin-skeleton-title" />
        <div className="admin-skeleton admin-skeleton-subtitle" />
      </div>
      <div className="admin-stats-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="stats-card">
            <div className="admin-skeleton admin-skeleton-label" />
            <div className="admin-skeleton admin-skeleton-value" />
          </div>
        ))}
      </div>
      <div className="admin-skeleton admin-skeleton-block mt-8" />
    </div>
  );
}
