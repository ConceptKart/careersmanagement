import { cache } from "react";
import { redirect } from "next/navigation";
import type { AuthSession } from "@/lib/auth/guards";
import { requireAuth } from "@/lib/auth/guards";
import {
  portalRepository,
  type PortalAchievement,
  type PortalCompanyDocument,
  type PortalDocument,
  type PortalEmployeeProfile,
  type PortalFeedbackItem,
  type PortalSalaryRecord,
} from "@/repositories/portal.repository";
import { companyDocumentsService } from "@/services/company-documents.service";
import { employeesService } from "@/services/employees.service";

export class PortalError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "PortalError";
  }
}

/** Dedupes layout + page profile fetches within a single RSC request. */
const getEmployeeByUserIdCached = cache(async (userId: string) => {
  return portalRepository.findEmployeeByUserId(userId);
});

/**
 * PHP parity: resolve employee via employees.user_id.
 * Dashboard allows null; other pages redirect to /portal.
 */
export async function requirePortalEmployee(): Promise<{
  session: AuthSession;
  employee: PortalEmployeeProfile;
}> {
  const session = await requireAuth();
  const employee = await getEmployeeByUserIdCached(session.user.id);
  if (!employee) {
    redirect("/portal");
  }
  return { session, employee };
}

export class PortalService {
  async getEmployeeProfile(
    userId: string,
  ): Promise<PortalEmployeeProfile | null> {
    return getEmployeeByUserIdCached(userId);
  }

  async getDocuments(employeeId: string): Promise<PortalDocument[]> {
    return portalRepository.findDocuments(employeeId);
  }

  async getSalaryHistory(employeeId: string): Promise<PortalSalaryRecord[]> {
    return portalRepository.findSalaryHistory(employeeId);
  }

  async getAchievements(employeeId: string): Promise<PortalAchievement[]> {
    return portalRepository.findAchievements(employeeId);
  }

  async getFeedback(employeeId: string): Promise<PortalFeedbackItem[]> {
    return portalRepository.findFeedback(employeeId);
  }

  async getCompanyDocuments(): Promise<PortalCompanyDocument[]> {
    return portalRepository.findActiveCompanyDocuments();
  }

  async submitFeedback(
    userId: string,
    values: { subject: string; message: string; category?: string },
  ) {
    const employee = await portalRepository.findEmployeeByUserId(userId);
    if (!employee) {
      throw new PortalError("Employee record not found");
    }
    return portalRepository.createFeedback({
      employeeId: employee.id,
      subject: values.subject,
      message: values.message,
      category: values.category,
    });
  }

  /**
   * Owned employee document download — never serves another employee's file.
   */
  async downloadOwnDocument(userId: string, filePath: string) {
    const employee = await portalRepository.findEmployeeByUserId(userId);
    if (!employee) return null;
    const owned = await portalRepository.findDocumentOwnedByEmployee(
      employee.id,
      filePath,
    );
    if (!owned?.filePath) return null;
    return employeesService.downloadDocument(owned.filePath);
  }

  /**
   * Active company documents only (PHP company-docs.php filter).
   */
  async downloadCompanyDocument(filePath: string) {
    const doc = await portalRepository.findActiveCompanyDocumentByPath(filePath);
    if (!doc?.filePath) return null;
    return companyDocumentsService.downloadDocument(doc.filePath);
  }
}

export const portalService = new PortalService();
