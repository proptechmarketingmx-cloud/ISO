import { PrismaClient, Rol } from "@prisma/client"
import bcrypt from "bcryptjs"

function getSeedDatabaseUrl() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!url) throw new Error("DIRECT_URL or DATABASE_URL must be set before seeding")
  return url
}

const prisma = new PrismaClient({
  datasources: { db: { url: getSeedDatabaseUrl() } },
})

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set before seeding")
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.usuario.upsert({
    where: { email },
    update: {
      nombre: "Administrador",
      passwordHash,
      rol: Rol.ADMIN,
      activo: true,
    },
    create: {
      nombre: "Administrador",
      email,
      passwordHash,
      rol: Rol.ADMIN,
      activo: true,
    },
  })

  await prisma.asesor.upsert({
    where: { email: "asesor@empresa.com" },
    update: {
      nombre: "Asesor de prueba",
      activo: true,
    },
    create: {
      nombre: "Asesor de prueba",
      email: "asesor@empresa.com",
      activo: true,
    },
  })

  for (const nombre of ["Casa", "Departamento"]) {
    await prisma.tipoPropiedad.upsert({
      where: { nombre },
      update: { activo: true },
      create: { nombre, activo: true },
    })
  }

  for (const nombre of ["Venta", "Renta"]) {
    await prisma.tipoOperacion.upsert({
      where: { nombre },
      update: { activo: true },
      create: { nombre, activo: true },
    })
  }
}

main()
  .catch((error) => {
    console.error("Error durante el seed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
