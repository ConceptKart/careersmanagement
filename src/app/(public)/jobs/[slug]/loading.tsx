export default function JobDetailLoading() {
  return (
    <section className="section-sm job-detail-page" aria-busy="true" aria-label="Loading job details">
      <div className="container job-detail-container">
        <div
          className="job-detail-back"
          style={{ width: 140, height: 20, background: "var(--muted)", borderRadius: 4 }}
        />

        <div className="job-detail-hero" style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              width: "70%",
              maxWidth: 480,
              height: 36,
              background: "var(--muted)",
              borderRadius: 6,
              marginBottom: "1rem",
            }}
          />
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{ width: 100, height: 18, background: "var(--muted)", borderRadius: 4 }}
              />
            ))}
          </div>
        </div>

        <div className="job-detail-layout" style={{ marginTop: "2rem" }}>
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 120,
                  background: "var(--muted)",
                  borderRadius: 8,
                  marginBottom: "1.5rem",
                }}
              />
            ))}
          </div>
          <div
            style={{
              height: 280,
              background: "var(--muted)",
              borderRadius: 8,
            }}
          />
        </div>
      </div>
    </section>
  );
}
