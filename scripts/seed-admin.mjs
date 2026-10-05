import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Pre-computed bcrypt hash of "admin123"
const ADMIN_PASSWORD_HASH = "$2b$10$6RG/QkA5QQnfMXHOaGWLlu4aHCCnK69rEkOoOvL7A0vrA/8C/DlXm";

async function main() {
  const email = "admin@conceptkart.com";
  console.log(`Checking database for user: ${email}...`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (existingUser) {
    console.log(`User ${email} found! Updating password hash...`);
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { passwordHash: ADMIN_PASSWORD_HASH },
    });

    const existingRoles = existingUser.roles.map((r) => r.role);
    if (!existingRoles.includes("admin")) {
      await prisma.userRoleAssignment.create({
        data: {
          id: crypto.randomUUID(),
          userId: existingUser.id,
          role: "admin",
        },
      });
    }
    if (!existingRoles.includes("hr")) {
      await prisma.userRoleAssignment.create({
        data: {
          id: crypto.randomUUID(),
          userId: existingUser.id,
          role: "hr",
        },
      });
    }
    console.log(`Successfully updated admin user password to: admin123`);
  } else {
    console.log(`User ${email} not found. Creating new admin user...`);
    const userId = crypto.randomUUID();
    await prisma.user.create({
      data: {
        id: userId,
        email,
        passwordHash: ADMIN_PASSWORD_HASH,
        roles: {
          create: [
            { id: crypto.randomUUID(), role: "admin" },
            { id: crypto.randomUUID(), role: "hr" },
          ],
        },
      },
    });
    console.log(`Successfully created admin user: ${email} with password: admin123`);
  }
}

main()
  .catch((e) => {
    console.error("Error seeding admin user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
