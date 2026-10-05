import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Concept Kart Careers — Build the future of audio",
  description:
    "Join Concept Kart, India's audio-first e-commerce destination. Explore open roles in engineering, product, design, and operations.",
};

const process = [
  {
    step: "01",
    title: "Apply",
    body: "Submit your application!! We check every application within 2~3 days.",
  },
  {
    step: "02",
    title: "Round 1: HR Screening",
    body: "Shortlisted candidates will receive a call from our HR to discuss their experience, expectations, and overall fit for the role.",
  },
  {
    step: "03",
    title: "Round 2: Face-to-Face Interview",
    body: "Selected applicants will be invited for a face-to-face interview with our hiring manager to evaluate their skills and role alignment for our team.",
  },
  {
    step: "04",
    title: "Congratulations!!",
    body: "Final candidates will receive confirmation from HR along with offer details and onboarding instructions to join our Team!!",
  },
];

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/**
 * Pixel-close port of index.php using the same CSS classes as the live site.
 * Reference: https://careers.conceptkart.co.in/
 */
export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="badge-indicator">
            <span />
            We&apos;re hiring across teams
          </div>
          <h1>Live the Tech. Build the Experience. Join our Team.</h1>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/jobs" className="btn btn-primary btn-lg">
              Plug In Here: Current Vacancies
              <ArrowIcon />
            </Link>
            <Link href="/check-status" className="btn btn-outline btn-lg">
              Check application status
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 700 }}>Our Story</h2>

            <p
              className="mt-4 text-muted-foreground"
              style={{ fontSize: "0.95rem", lineHeight: 1.75 }}
            >
              At Concept Kart, we believe that technology should be an experience, not just a
              utility. We aren&apos;t just curators of gadgets; we are enthusiasts first. We know
              the thrill of unboxing a new pair of IEMs or finally hearing that perfect sound
              signature—and we&apos;ve turned passion into a mission, mission to bring the latest
              to the audience here in India.
            </p>
            <p
              className="mt-4 text-muted-foreground"
              style={{ fontSize: "0.95rem", lineHeight: 1.75 }}
            >
              Working here means being part of the bridge between global innovation and the Indian
              tech community. We&apos;ve spent years breaking down borders to bring the world&apos;s
              most sought-after gear to our doorstep. Now, we&apos;re looking for people who
              don&apos;t just want a job, but want to help us redefine tech market in India. If you
              value craftsmanship, performance, and the &quot;wow&quot; factor of a breakthrough
              product, you&apos;ll fit right in. Your search for a career fueled by passion ends
              here.
            </p>

            <div className="stats-row">
              <div className="stat-pill">
                <span className="stat-number">350,000+</span>
                <span className="stat-label">Customers Served</span>
              </div>
              <div className="stat-pill">
                <span className="stat-number">90+</span>
                <span className="stat-label">Brands</span>
              </div>
              <div className="stat-pill">
                <span className="stat-number">4.2 ★</span>
                <span className="stat-label">Store Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Our hiring process</h2>
          <br />
          <div className="process-grid mt-10">
            {process.map((p) => (
              <div key={p.step} className="process-card">
                <div className="process-step">{p.step}</div>
                <h3 className="mt-2 font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/jobs" className="btn-orange-cta" style={{ marginTop: 0 }}>
              Plug In Here: Current Vacancies
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
