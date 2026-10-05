import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { isStaffAdmin } from "@/lib/auth/roles";

export type AuthSession = Session & {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
};

/**
 * Require any authenticated user (mirrors PHP requireAuth).
 * Redirects to login when session is missing or expired.
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  return session as AuthSession;
}

/**
 * Require staff admin roles: admin, hr, or ceo (mirrors PHP requireAdmin).
 * Redirects unauthenticated users to login; non-staff to /unauthorized.
 */
export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth();

  if (!isStaffAdmin(session.user.roles ?? [])) {
    redirect("/unauthorized");
  }

  return session;
}
