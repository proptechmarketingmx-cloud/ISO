import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [clientes, propiedades, asesores, matches] = await Promise.all([
    prisma.cliente.count({ where: { deletedAt: null } }),
    prisma.propiedad.count({ where: { deletedAt: null } }),
    prisma.asesor.count({ where: { status: 'activo' } }),
    prisma.compatibilidadClientePropiedad.count(),
  ]);
  return NextResponse.json({ clientes, propiedades, asesores, matches });
}
