import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const roles = await prisma.rol.findMany({
    include: { permisos: true },
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json(roles);
}

export async function PATCH(request: NextRequest) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const body = await request.json();
  const id = Number(body.id_rol);
  if (!Number.isInteger(id) || !Array.isArray(body.permisos)) {
    return NextResponse.json({ error: 'id_rol y permisos son obligatorios' }, { status: 400 });
  }

  const role = await prisma.rol.findUnique({ where: { id_rol: id } });
  if (!role) return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });

  await prisma.$transaction([
    prisma.permiso.deleteMany({ where: { id_rol: id } }),
    prisma.permiso.createMany({
      data: body.permisos.map((permission: any) => ({
        id_rol: id,
        modulo: String(permission.modulo),
        puede_crear: Boolean(permission.puede_crear),
        puede_leer: Boolean(permission.puede_leer),
        puede_editar: Boolean(permission.puede_editar),
        puede_eliminar: Boolean(permission.puede_eliminar),
      })),
    }),
  ]);

  return NextResponse.json(await prisma.rol.findUnique({ where: { id_rol: id }, include: { permisos: true } }));
}
