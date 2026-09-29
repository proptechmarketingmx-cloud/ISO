import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando seed de la base de datos...")

  // 1. Crear o actualizar Tenant base
  const tenant = await prisma.tenant.upsert({
    where: { slug: "proptech-mx" },
    update: {
      nombre: "PropTech MX",
      activo: true,
    },
    create: {
      nombre: "PropTech MX",
      slug: "proptech-mx",
      plan: "pro",
      activo: true,
    },
  })

  console.log(`Tenant listo: ${tenant.nombre} (ID: ${tenant.id_tenant})`)

  // 2. Crear o actualizar Asesor base
  const asesor = await prisma.asesor.upsert({
    where: { correo: "admin@proptech.mx" },
    update: {
      nombre: "Admin",
      apellidos: "Principal",
      id_tenant: tenant.id_tenant,
      status: "activo",
    },
    create: {
      id_tenant: tenant.id_tenant,
      nombre: "Admin",
      apellidos: "Principal",
      correo: "admin@proptech.mx",
      telefono: "5512345678",
      status: "activo",
    },
  })

  console.log(`Asesor listo: ${asesor.nombre} ${asesor.apellidos} (ID: ${asesor.id_asesor})`)

  console.log("Seed completado exitosamente.")
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
