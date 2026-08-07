import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await prisma.asesor.findMany({ include: { _count: { select: { clientes: true, propiedades: true } } }, orderBy: { nombre: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.nombre || !body.apellidos) return NextResponse.json({ error: 'nombre y apellidos son obligatorios' }, { status: 400 });
  return NextResponse.json(await prisma.asesor.create({ data: body }), { status: 201 });
}
