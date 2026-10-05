export default function PublicLoading() {
  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "3rem" }}>
      <div className="admin-loading" aria-busy="true" aria-label="Loading">
        <div className="admin-loading-header">
          <div className="admin-skeleton admin-skeleton-title" />
          <div className="admin-skeleton admin-skeleton-subtitle" />
        </div>
        <div className="admin-skeleton admin-skeleton-block mt-8" />
      </div>
    </div>
  );
}
