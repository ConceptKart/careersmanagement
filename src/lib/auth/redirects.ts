import { isStaffAdmin } from "@/lib/auth/roles";

/** Prevent open redirects; only allow same-origin relative paths. */
export function sanitizeCallbackUrl(callbackUrl: string | null | undefined): string | null {
  if (!callbackUrl) return null;
  const trimmed = callbackUrl.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }
  return trimmed;
}

/**
 * Post-login destination — staff → /admin, others → /portal.
 * Honors callbackUrl when safe; blocks non-staff from admin destinations.
 */
export function resolvePostLoginPath(
  roles: readonly string[],
  callbackUrl?: string | null,
): string {
  const staff = isStaffAdmin(roles);
  const safeCallback = sanitizeCallbackUrl(callbackUrl);

  if (safeCallback) {
    if (safeCallback.startsWith("/admin") && !staff) {
      return "/portal";
    }
    if (safeCallback === "/admin/login") {
      return staff ? "/admin" : "/portal";
    }
    return safeCallback;
  }

  return staff ? "/admin" : "/portal";
}
