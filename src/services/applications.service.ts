import { promises as fs } from "fs";
import path from "path";
import type { ApplicationStatus } from "@prisma/client";
import { getEnv } from "@/lib/config/env";
import { getStorage } from "@/lib/storage";
import { buildStoredCoverLetter } from "@/lib/utils/application-content";
import { generateId } from "@/lib/utils/id";
import { applicationsRepository } from "@/repositories/applications.repository";
import { jobsRepository } from "@/repositories/jobs.repository";
import type { AdminApplicationListFilters } from "@/validators/admin-application.schema";
import { applyFormSchema, type ApplyFormValues } from "@/validators/application.schema";

const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXT = new Set(["pdf", "doc", "docx"]);

const RESUME_MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string>,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export type ResumeFile = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
};

function isAllowedResumeType(ext: string, mimeType: string): boolean {
  if (!ALLOWED_EXT.has(ext)) return false;
  if (!mimeType || mimeType === "application/octet-stream") return true;
  return ALLOWED_RESUME_TYPES.has(mimeType);
}

function sanitizeResumeRelativePath(file: string): string | null {
  let normalized = file.replace(/%2F/gi, "/").replace(/\\/g, "/");
  normalized = normalized.replace(/[^a-zA-Z0-9_\-./]/g, "");
  normalized = normalized.replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) return null;
  return normalized;
}

/**
 * PHP reference (apply.php + admin/applications.php + api/download.php).
 */
export class ApplicationsService {
  async submit(jobId: string, values: ApplyFormValues, resume: ResumeFile) {
    const parsed = applyFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      throw new ApplicationError("Validation failed", fieldErrors, 422);
    }

    const job = await jobsRepository.findActiveById(jobId);
    if (!job) {
      throw new ApplicationError("Job not found or not active", undefined, 404);
    }

    const existing = await applicationsRepository.findByJobAndEmail(
      jobId,
      parsed.data.email,
    );
    if (existing) {
      throw new ApplicationError(
        "You have already applied for this role",
        { email: "An application with this email already exists for this job" },
        409,
      );
    }

    const maxBytes = getEnv().MAX_UPLOAD_BYTES;
    if (!resume || resume.size <= 0) {
      throw new ApplicationError("Resume is required", { resume: "Resume is required" }, 422);
    }
    if (resume.size > maxBytes) {
      throw new ApplicationError("Resume too large", {
        resume: "Only PDF, DOC, or DOCX files under 5MB are allowed",
      }, 422);
    }

    const ext = (resume.filename.split(".").pop() ?? "").toLowerCase();
    if (!isAllowedResumeType(ext, resume.mimeType)) {
      throw new ApplicationError("Invalid resume type", {
        resume: "Only PDF, DOC, or DOCX files under 5MB are allowed",
      }, 422);
    }

    const resumePath = `${jobId}/${generateId()}.${ext}`;
    await getStorage().put({
      key: `resumes/${resumePath}`,
      data: resume.buffer,
      contentType: resume.mimeType,
    });

    const application = await applicationsRepository.create({
      jobId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      linkedinUrl: parsed.data.linkedinUrl?.trim() || undefined,
      coverLetter: buildStoredCoverLetter(parsed.data),
      resumePath,
    });

    return { applicationId: application.id, jobTitle: job.title };
  }

  async getStatusByEmail(email: string) {
    return applicationsRepository.findStatusByEmail(email);
  }

  getApplications(filters: AdminApplicationListFilters) {
    return applicationsRepository.findAdminList(filters);
  }

  getApplication(id: string) {
    return applicationsRepository.findAdminDetail(id);
  }

  listJobOptions() {
    return applicationsRepository.findJobOptions();
  }

  async updateStatus(id: string, status: ApplicationStatus) {
    const existing = await applicationsRepository.findAdminDetail(id);
    if (!existing) return null;
    return applicationsRepository.updateStatus(id, status);
  }

  async updateAdminNotes(id: string, notes: string) {
    const existing = await applicationsRepository.findAdminDetail(id);
    if (!existing) return null;
    const trimmed = notes.trim();
    return applicationsRepository.updateAdminNotes(id, trimmed || null);
  }

  /** Whether the on-disk resume file exists for a DB `resume_path`. */
  async resumeFileExists(resumePath: string | null | undefined): Promise<boolean> {
    const safe = sanitizeResumeRelativePath(resumePath ?? "");
    if (!safe) return false;
    const storage = getStorage();
    if (!storage.exists) return false;
    return storage.exists(`resumes/${safe}`);
  }

  /**
   * Resolve resume for admin download/preview (mirrors api/download.php).
   * `resumePath` in DB is relative under uploads/resumes/.
   */
  async downloadResume(resumePath: string): Promise<{
    buffer: Buffer;
    contentType: string;
    size: number;
    filename: string;
  } | null> {
    const safe = sanitizeResumeRelativePath(resumePath);
    if (!safe) return null;

    const key = `resumes/${safe}`;
    const storage = getStorage();

    if (!storage.exists || !(await storage.exists(key))) {
      return null;
    }

    const ext = path.extname(safe).slice(1).toLowerCase();
    const contentType = RESUME_MIME[ext] ?? "application/octet-stream";
    const filename = path.basename(safe);

    if (typeof storage.resolveLocalPath === "function") {
      const fullPath = storage.resolveLocalPath(key);
      if (!fullPath) return null;
      const buffer = await fs.readFile(fullPath);
      return {
        buffer,
        contentType,
        size: buffer.byteLength,
        filename,
      };
    }

    const streamed = await storage.getStream(key);
    const chunks: Buffer[] = [];
    for await (const chunk of streamed.stream as AsyncIterable<Buffer | string>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    return {
      buffer,
      contentType,
      size: buffer.byteLength,
      filename,
    };
  }
}

export const applicationsService = new ApplicationsService();
