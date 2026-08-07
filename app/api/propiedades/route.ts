import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') || undefined;
    const status = searchParams.get('status') || undefined;
    const busqueda = searchParams.get('busqueda') || undefined;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0;
    const take = searchParams.get('take') ? parseInt(searchParams.get('take')!) : 50;

    const where: any = { deletedAt: null };
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
        { ciudad: { contains: busqueda, mode: 'insensitive' } },
        { colonia: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.propiedad.count({ where }),
      prisma.propiedad.findMany({
        where,
        include: {
          asesor: true,
          multimedia: { orderBy: { orden: 'asc' } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return NextResponse.json({ total, items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al listar propiedades' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.titulo || !body.precio || !body.tipo || !body.tipo_operacion) {
      return NextResponse.json({ error: 'Título, precio, tipo y tipo de operación son requeridos' }, { status: 400 });
    }

    const nuevaPropiedad = await prisma.propiedad.create({
      data: body,
      include: { asesor: true, multimedia: true },
    });

    return NextResponse.json(nuevaPropiedad, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear propiedad' }, { status: 500 });
  }
}
