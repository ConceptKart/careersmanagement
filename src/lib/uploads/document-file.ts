import { getEnv } from "@/lib/config/env";

/** Allowed extensions for company + employee document uploads. */
export const DOCUMENT_ALLOWED_EXT = new Set([
  "pdf",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
]);

const DOCUMENT_ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

export const DOCUMENT_ACCEPT_ATTR =
  ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png";

export type DocumentUploadInput = {
  filename: string;
  mimeType: string;
  size: number;
};

export type DocumentUploadOk = {
  ok: true;
  ext: string;
};

export type DocumentUploadErr = {
  ok: false;
  message: string;
};

/**
 * Validate size, extension, and MIME for admin document uploads.
 * Allows empty/octet-stream MIME when extension is allowlisted (browser quirk).
 */
export function validateDocumentUpload(
  file: DocumentUploadInput,
): DocumentUploadOk | DocumentUploadErr {
  const maxBytes = getEnv().MAX_UPLOAD_BYTES;
  if (file.size <= 0) {
    return { ok: false, message: "File is required" };
  }
  if (file.size > maxBytes) {
    return { ok: false, message: "File must be under 5MB" };
  }

  const ext = (file.filename.split(".").pop() ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (!ext || !DOCUMENT_ALLOWED_EXT.has(ext)) {
    return {
      ok: false,
      message: "Only PDF, DOC, DOCX, JPG, or PNG files are allowed",
    };
  }

  const mime = (file.mimeType || "").toLowerCase().trim();
  if (mime && mime !== "application/octet-stream" && !DOCUMENT_ALLOWED_MIME.has(mime)) {
    return {
      ok: false,
      message: "Only PDF, DOC, DOCX, JPG, or PNG files are allowed",
    };
  }

  return { ok: true, ext };
}

/** Safe filename for Content-Disposition (strip quotes/control chars). */
export function sanitizeDownloadFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "download";
  return base.replace(/["\r\n\\]/g, "_").slice(0, 180) || "download";
}
