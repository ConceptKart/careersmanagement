import Link from "next/link";

export default function JobNotFound() {
  return (
    <section className="section-sm job-detail-page">
      <div className="container job-detail-container">
        <h1 className="page-title">Role not found</h1>
        <p className="page-description">
          This job posting may have been removed or the link is incorrect.
        </p>
        <Link href="/jobs" className="btn btn-primary">
          Browse open roles
        </Link>
      </div>
    </section>
  );
}
