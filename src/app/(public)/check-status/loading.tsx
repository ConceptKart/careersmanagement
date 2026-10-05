export default function CheckStatusLoading() {
  return (
    <section className="section-sm status-page" aria-busy="true" aria-label="Loading status page">
      <div className="container max-w-2xl">
        <div
          style={{
            width: "60%",
            maxWidth: 320,
            height: 32,
            background: "var(--muted)",
            borderRadius: 6,
            marginBottom: "0.75rem",
          }}
        />
        <div
          style={{
            width: "80%",
            height: 18,
            background: "var(--muted)",
            borderRadius: 4,
            marginBottom: "2rem",
          }}
        />
        <div
          style={{
            height: 120,
            background: "var(--muted)",
            borderRadius: 8,
            marginBottom: "1rem",
          }}
        />
      </div>
    </section>
  );
}
