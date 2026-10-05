import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/validators/auth.schema";

export type AuthenticatedUser = {
  id: string;
  email: string;
  roles: string[];
};

export type VerifyCredentialsResult =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; reason: "invalid_input" | "invalid_credentials" };

/**
 * Shared credential verification for Auth.js authorize() and login flows.
 * Mirrors admin/login.php: email lookup → bcrypt verify → load user_roles.
 */
export async function verifyCredentials(
  raw: unknown,
): Promise<VerifyCredentialsResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: "invalid_input" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { roles: true },
  });

  if (!user) {
    return { ok: false, reason: "invalid_credentials" };
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { ok: false, reason: "invalid_credentials" };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles.map((assignment) => assignment.role),
    },
  };
}
