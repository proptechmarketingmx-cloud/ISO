import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [clientes, asesores, relacionesClientes, relacionesAsesores] = await Promise.all([
    prisma.cliente.findMany({ where: { deletedAt: null }, select: { id_cliente: true, nombre: true, apellido_paterno: true, estado_cliente: true, municipio: true } }),
    prisma.asesor.findMany({ where: { status: 'activo' }, select: { id_asesor: true, nombre: true, apellidos: true } }),
    prisma.relacionCliente.findMany(),
    prisma.relacionAsesor.findMany(),
  ]);
  return NextResponse.json({ clientes, asesores, relacionesClientes, relacionesAsesores });
}
