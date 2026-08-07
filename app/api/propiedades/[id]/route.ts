import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const propiedad = await prisma.propiedad.findUnique({
      where: { id_propiedad: id },
      include: {
        asesor: true,
        multimedia: { orderBy: { orden: 'asc' } },
        actividades: { orderBy: { fecha: 'desc' } },
        documentos: { orderBy: { fecha_subida: 'desc' } },
        notas: { orderBy: { fecha: 'desc' } },
        historial: { orderBy: { fecha: 'desc' } },
      },
    });

    if (!propiedad || propiedad.deletedAt) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    return NextResponse.json(propiedad);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener propiedad' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const body = await req.json();
    const actualizada = await prisma.propiedad.update({
      where: { id_propiedad: id },
      data: body,
      include: { asesor: true, multimedia: true },
    });

    return NextResponse.json(actualizada);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al actualizar propiedad' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    await prisma.propiedad.update({
      where: { id_propiedad: id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ mensaje: 'Propiedad eliminada suavemente con éxito' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al eliminar propiedad' }, { status: 500 });
  }
}
