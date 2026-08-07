import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const email = process.env.ADMIN_EMAIL || 'admin@demo.com';
const password = process.env.ADMIN_PASSWORD || 'admin123';

try {
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.usuario.upsert({
    where: { email },
    update: { password_hash: hash, activo: true, nombre: 'Admin Demo' },
    create: { email, password_hash: hash, activo: true, nombre: 'Admin Demo' },
  });
  console.log(`Administrador listo: ${user.email}`);
} finally {
  await prisma.$disconnect();
}
