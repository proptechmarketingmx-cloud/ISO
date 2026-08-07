import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  return NextResponse.json(await prisma.usuario.findMany({ include: { roles: { include: { rol: true } }, asesor: true, tenant: true }, orderBy: { created_at: 'desc' } }));
}

export async function PATCH(req: NextRequest) {
  const { id_usuario, ...data } = await req.json();
  if (!id_usuario) return NextResponse.json({ error: 'id_usuario es obligatorio' }, { status: 400 });
  return NextResponse.json(await prisma.usuario.update({ where: { id_usuario: Number(id_usuario) }, data }));
}
