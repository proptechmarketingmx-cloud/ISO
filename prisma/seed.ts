import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const configuredEmail = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!configuredEmail || !password) {
    throw new Error("ADMIN_EMAIL y ADMIN_PASSWORD deben estar configuradas");
  }

  const email = configuredEmail.trim().toLowerCase();
  if (!email) {
    throw new Error("ADMIN_EMAIL no puede estar vacía");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.usuario.upsert({
    where: { email },
    update: {
      nombre: "Administrador",
      passwordHash,
      rol: "ADMIN",
      activo: true,
    },
    create: {
      nombre: "Administrador",
      email,
      passwordHash,
      rol: "ADMIN",
      activo: true,
    },
  });

  console.log(`Usuario administrador listo: ${admin.email}`);
}

main()
  .catch((error: unknown) => {
    console.error("Error durante el seed del administrador:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
