export default function PortalLoading() {
  return (
    <div className="admin-loading" aria-busy="true" aria-label="Loading portal">
      <div className="admin-loading-header">
        <div className="admin-skeleton admin-skeleton-title" />
        <div className="admin-skeleton admin-skeleton-subtitle" />
      </div>
      <div className="admin-skeleton admin-skeleton-block mt-8" />
    </div>
  );
}
