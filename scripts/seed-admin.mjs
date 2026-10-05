import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@conceptkart.com";
  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  console.log(`Checking database for user: ${email}...`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (existingUser) {
    console.log(`User ${email} found! Updating password hash...`);
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { passwordHash },
    });

    // Ensure user_roles has admin and hr
    const existingRoles = existingUser.roles.map((r) => r.role);
    if (!existingRoles.includes("admin")) {
      await prisma.userRoleAssignment.create({
        data: {
          id: uuidv4(),
          userId: existingUser.id,
          role: "admin",
        },
      });
    }
    if (!existingRoles.includes("hr")) {
      await prisma.userRoleAssignment.create({
        data: {
          id: uuidv4(),
          userId: existingUser.id,
          role: "hr",
        },
      });
    }
    console.log(`Successfully updated admin user password to: ${password}`);
  } else {
    console.log(`User ${email} not found. Creating new admin user...`);
    const userId = uuidv4();
    await prisma.user.create({
      data: {
        id: userId,
        email,
        passwordHash,
        roles: {
          create: [
            { id: uuidv4(), role: "admin" },
            { id: uuidv4(), role: "hr" },
          ],
        },
      },
    });
    console.log(`Successfully created admin user: ${email} with password: ${password}`);
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
