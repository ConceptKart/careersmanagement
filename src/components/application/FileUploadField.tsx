"use client";

import { useId, useState } from "react";

type Props = {
  name?: string;
  error?: string;
  required?: boolean;
  onFileChange?: (file: File | null) => void;
};

export function FileUploadField({
  name = "resume",
  error,
  required = true,
  onFileChange,
}: Props) {
  const inputId = useId();
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={inputId}>
        Resume
        {required && <span className="required"> *</span>}
        <span className="text-muted-foreground" style={{ fontWeight: "normal" }}>
          {" "}
          (PDF, DOC, DOCX — max 5 MB)
        </span>
      </label>
      <label htmlFor={inputId} className="file-upload">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-sm text-muted-foreground">
          {fileName ?? "Click to upload your resume"}
        </span>
      </label>
      <input
        id={inputId}
        type="file"
        name={name}
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        required={required}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          setFileName(file?.name ?? null);
          onFileChange?.(file);
        }}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
