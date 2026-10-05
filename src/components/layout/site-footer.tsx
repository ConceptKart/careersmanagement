import Link from "next/link";

/** Mirrors includes/footer.php */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <p>&copy; {year} Concept Kart. All rights reserved.</p>
        <div className="footer-links">
          <Link href="/jobs">Open Roles</Link>
          <Link href="/check-status">Check Status</Link>
        </div>
      </div>
    </footer>
  );
}
