import type { UserRole } from "@prisma/client";

/** Staff roles that may access /admin (mirrors PHP isStaffAdmin). */
export const STAFF_ROLES: readonly UserRole[] = ["admin", "hr", "ceo"] as const;

export function isStaffAdmin(roles: readonly string[]): boolean {
  return roles.some((role) => STAFF_ROLES.includes(role as UserRole));
}

export function isEmployee(roles: readonly string[]): boolean {
  return roles.includes("employee");
}
