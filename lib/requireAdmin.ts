import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('iso_session')?.value;
  if (!token) return null;
  try {
    const { payload } = await verifySession(token);
    const user = await prisma.usuario.findUnique({ where: { id_usuario: Number(payload.sub) }, include: { roles: { include: { rol: true } } } });
    return user?.activo && user.roles.some((item) => item.rol.slug === 'admin') ? user : null;
  } catch { return null; }
}
