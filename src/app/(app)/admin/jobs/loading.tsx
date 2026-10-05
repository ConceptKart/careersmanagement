export default function AdminJobsLoading() {
  return (
    <div className="admin-loading" aria-busy="true" aria-label="Loading jobs">
      <div className="admin-skeleton admin-skeleton-title" />
      <div className="admin-skeleton admin-skeleton-subtitle" />
      <div className="admin-skeleton admin-skeleton-block mt-6" />
    </div>
  );
}
