import {
  achievementsRepository,
  type AdminAchievementListResult,
} from "@/repositories/achievements.repository";
import { employeesRepository } from "@/repositories/employees.repository";
import type {
  AdminAchievementFormValues,
  AdminAchievementListFilters,
} from "@/validators/admin-achievement.schema";

export class AchievementError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "AchievementError";
  }
}

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export class AchievementsService {
  async getAchievements(
    filters: AdminAchievementListFilters,
  ): Promise<AdminAchievementListResult> {
    return achievementsRepository.findAdminList(filters);
  }

  async getAchievement(id: string) {
    return achievementsRepository.findById(id);
  }

  async listEmployeeOptions() {
    return employeesRepository.listEmployeeOptions();
  }

  async createAchievement(
    values: AdminAchievementFormValues,
    createdBy: string | null,
  ) {
    const employee = await employeesRepository.findById(values.employeeId);
    if (!employee) {
      throw new AchievementError("Employee not found", {
        employeeId: "Employee not found",
      });
    }
    return achievementsRepository.create({
      employeeId: values.employeeId,
      title: values.title,
      description: values.description ?? null,
      achievedOn: parseDateOnly(values.achievedOn),
      createdBy,
    });
  }

  async updateAchievement(id: string, values: AdminAchievementFormValues) {
    const existing = await achievementsRepository.findById(id);
    if (!existing) return null;
    const employee = await employeesRepository.findById(values.employeeId);
    if (!employee) {
      throw new AchievementError("Employee not found", {
        employeeId: "Employee not found",
      });
    }
    return achievementsRepository.update(id, {
      employeeId: values.employeeId,
      title: values.title,
      description: values.description ?? null,
      achievedOn: parseDateOnly(values.achievedOn),
    });
  }

  async deleteAchievement(id: string) {
    return achievementsRepository.delete(id);
  }
}

export const achievementsService = new AchievementsService();
