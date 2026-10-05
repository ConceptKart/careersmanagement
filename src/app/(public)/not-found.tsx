import Link from "next/link";

export default function PublicNotFound() {
  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "3rem" }}>
      <div className="page-header">
        <h1 className="page-title">Page not found</h1>
        <p className="page-description">
          The page you are looking for does not exist or is no longer available.
        </p>
      </div>
      <Link href="/jobs" className="btn btn-primary">
        Browse open roles
      </Link>
    </div>
  );
}
