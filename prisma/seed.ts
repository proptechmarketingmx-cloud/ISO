import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL y ADMIN_PASSWORD deben estar configuradas");
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
