"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Mirrors includes/header.php */
export function SiteHeader() {
  const pathname = usePathname();
  const jobsActive = pathname.startsWith("/jobs") || pathname.startsWith("/apply");
  const statusActive = pathname.startsWith("/check-status");

  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Concept Kart"
            className="logo-img"
            style={{
              height: "3.00rem",
              width: "auto",
              background: "white",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
            }}
          />
        </Link>
        <nav>
          <Link href="/jobs" className={jobsActive ? "active" : undefined}>
            Open Roles
          </Link>
          <Link href="/check-status" className={statusActive ? "active" : undefined}>
            Check Status
          </Link>
        </nav>
      </div>
    </header>
  );
}
