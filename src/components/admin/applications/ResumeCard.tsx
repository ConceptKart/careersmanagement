type Props = {
  resumePath: string | null;
  candidateName: string;
  /** False when DB has a path but the file is missing on disk. */
  resumeAvailable?: boolean;
};

export function ResumeCard({
  resumePath,
  candidateName,
  resumeAvailable = true,
}: Props) {
  if (!resumePath) {
    return (
      <section className="card">
        <h2>Resume</h2>
        <p className="text-sm text-muted-foreground">No resume uploaded.</p>
      </section>
    );
  }

  if (!resumeAvailable) {
    return (
      <section className="card">
        <h2>Resume</h2>
        <p className="text-sm text-muted-foreground">
          Resume was recorded for this application, but the file is missing from
          storage.
        </p>
      </section>
    );
  }

  const previewUrl = `/api/admin/downloads?type=resumes&file=${encodeURIComponent(resumePath)}`;
  const downloadUrl = `${previewUrl}&download=1`;
  const ext = resumePath.split(".").pop()?.toLowerCase() ?? "";
  const canPreview = ext === "pdf";

  return (
    <section className="card">
      <h2>Resume</h2>
      {canPreview ? (
        <div className="resume-preview-wrapper">
          <iframe
            title={`Resume — ${candidateName}`}
            src={previewUrl}
            width="100%"
            height="500"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-3">
          Preview is available for PDF files. Use download or open for DOC/DOCX.
        </p>
      )}
      <div className="flex gap-2 mt-3">
        <a href={downloadUrl} className="btn btn-outline btn-sm">
          Download
        </a>
        <a href={previewUrl} className="btn btn-secondary btn-sm" target="_blank" rel="noreferrer">
          Open in new tab
        </a>
      </div>
    </section>
  );
}
