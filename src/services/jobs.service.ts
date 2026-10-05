import { cache } from "react";
import { parseJobIdFromSlug } from "@/lib/utils/job-slug";
import { jobsRepository } from "@/repositories/jobs.repository";
import type { JobListFilters } from "@/validators/application.schema";
import type {
  AdminJobFormValues,
  AdminJobListFilters,
} from "@/validators/admin-job.schema";

const getJobDetailByIdCached = cache(async (id: string) => {
  return jobsRepository.findDetailById(id);
});

/**
 * Jobs domain service — public listing + admin CRUD.
 */
export class JobsService {
  listPublic(filters: JobListFilters) {
    return jobsRepository.findActive(filters);
  }

  listDepartments() {
    return jobsRepository.findActiveDepartments();
  }

  listLocations() {
    return jobsRepository.findActiveLocations();
  }

  listAdminDepartments() {
    return jobsRepository.findAllDepartments();
  }

  listAdminLocations() {
    return jobsRepository.findAllLocations();
  }

  getById(id: string) {
    return jobsRepository.findById(id);
  }

  getDetailById(id: string) {
    return getJobDetailByIdCached(id);
  }

  getBySlug(slug: string) {
    const id = parseJobIdFromSlug(slug);
    if (!id) return Promise.resolve(null);
    return getJobDetailByIdCached(id);
  }

  getActiveById(id: string) {
    return jobsRepository.findActiveById(id);
  }

  getRelatedJobs(jobId: string, department: string) {
    return jobsRepository.findRelated(jobId, department);
  }

  getJobs(filters: AdminJobListFilters) {
    return jobsRepository.findAdminList(filters);
  }

  getJob(id: string) {
    return jobsRepository.findDetailById(id);
  }

  createJob(data: AdminJobFormValues) {
    return jobsRepository.create(data);
  }

  updateJob(id: string, data: AdminJobFormValues) {
    return jobsRepository.update(id, data);
  }

  async deleteJob(id: string): Promise<
    { ok: true } | { ok: false; reason: "not_found" | "has_applications"; count?: number }
  > {
    const job = await jobsRepository.findById(id);
    if (!job) return { ok: false, reason: "not_found" };

    const count = await jobsRepository.countApplications(id);
    if (count > 0) {
      return { ok: false, reason: "has_applications", count };
    }

    await jobsRepository.delete(id);
    return { ok: true };
  }

  async toggleStatus(id: string, isActive: boolean) {
    const job = await jobsRepository.findById(id);
    if (!job) return null;
    return jobsRepository.setActive(id, isActive);
  }

  duplicateJob(id: string) {
    return jobsRepository.duplicate(id);
  }

  countApplications(jobId: string) {
    return jobsRepository.countApplications(jobId);
  }
}

export const jobsService = new JobsService();
