import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calcularCompatibilidad } from '@/lib/services/matchingService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clienteIdStr = searchParams.get('cliente_id');
    const propiedadIdStr = searchParams.get('propiedad_id');

    if (clienteIdStr && propiedadIdStr) {
      const clienteId = parseInt(clienteIdStr);
      const propiedadId = parseInt(propiedadIdStr);
      const [cliente, propiedad] = await Promise.all([
        prisma.cliente.findUnique({ where: { id_cliente: clienteId } }),
        prisma.propiedad.findUnique({ where: { id_propiedad: propiedadId } }),
      ]);

      if (!cliente || !propiedad) {
        return NextResponse.json({ error: 'Cliente o propiedad no encontrado' }, { status: 404 });
      }

      const match = calcularCompatibilidad(cliente, propiedad);
      return NextResponse.json(match);
    }

    if (clienteIdStr) {
      const clienteId = parseInt(clienteIdStr);
      const cliente = await prisma.cliente.findUnique({ where: { id_cliente: clienteId } });
      if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });

      const propiedades = await prisma.propiedad.findMany({
        where: { status: 'disponible', deletedAt: null },
      });

      const matches = propiedades.map((p) => {
        const res = calcularCompatibilidad(cliente, p);
        return {
          id_propiedad: p.id_propiedad,
          titulo: p.titulo,
          precio: p.precio,
          ciudad: p.ciudad,
          tipo: p.tipo,
          ...res,
        };
      });

      matches.sort((a, b) => b.score_total - a.score_total);
      return NextResponse.json(matches);
    }

    if (propiedadIdStr) {
      const propiedadId = parseInt(propiedadIdStr);
      const propiedad = await prisma.propiedad.findUnique({ where: { id_propiedad: propiedadId } });
      if (!propiedad) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });

      const clientes = await prisma.cliente.findMany({ where: { deletedAt: null } });
      const matches = clientes.map((c) => {
        const res = calcularCompatibilidad(c, propiedad);
        return {
          id_cliente: c.id_cliente,
          nombre_completo: `${c.nombre} ${c.apellido_paterno} ${c.apellido_materno || ''}`.trim(),
          correo: c.correo,
          whatsapp: c.whatsapp,
          ...res,
        };
      });

      matches.sort((a, b) => b.score_total - a.score_total);
      return NextResponse.json(matches);
    }

    return NextResponse.json({ error: 'Debe especificar cliente_id o propiedad_id' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error en cálculo de matching' }, { status: 500 });
  }
}
