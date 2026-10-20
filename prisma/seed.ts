import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@empresa.com";
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: {
      nombre: "Administrador",
      email,
      passwordHash,
      rol: Rol.ADMIN,
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
