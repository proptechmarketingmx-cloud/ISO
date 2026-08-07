import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await prisma.usuario.findMany({ select: { id_usuario: true, email: true, nombre: true, activo: true, id_tenant: true, id_asesor: true, created_at: true }, orderBy: { created_at: 'desc' } }));
}

export async function PATCH(req: NextRequest) {
  const { id_usuario, ...data } = await req.json();
  if (!id_usuario) return NextResponse.json({ error: 'id_usuario es obligatorio' }, { status: 400 });
  return NextResponse.json(await prisma.usuario.update({ where: { id_usuario: Number(id_usuario) }, data }));
}
