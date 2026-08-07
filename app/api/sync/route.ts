import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSyncSecurity } from '@/lib/sync/security';

export async function GET(req: NextRequest) {
  const sec = validateSyncSecurity(req);
  if (!sec.valid) {
    return NextResponse.json({ error: sec.error }, { status: sec.status || 403 });
  }

  const { searchParams } = new URL(req.url);
  const sinceParam = searchParams.get('since');
  const sinceDate = sinceParam ? new Date(sinceParam) : new Date(0);

  try {
    const usuarios = await prisma.usuario.findMany({
      where: { updated_at: { gt: sinceDate } },
    });

    const propiedades = await prisma.propiedad.findMany({
      where: { updatedAt: { gt: sinceDate } },
    });

    const clientes = await prisma.cliente.findMany({
      where: { updatedAt: { gt: sinceDate } },
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      data: {
        usuarios,
        propiedades,
        clientes,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al consultar datos de sincronización', detail: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const sec = validateSyncSecurity(req);
  if (!sec.valid) {
    return NextResponse.json({ error: sec.error }, { status: sec.status || 403 });
  }

  try {
    const body = await req.json();
    const payload = body?.data || {};

    const appliedCounts = { usuarios: 0, propiedades: 0, clientes: 0 };
    const skippedCounts = { usuarios: 0, propiedades: 0, clientes: 0 };

    if (Array.isArray(payload.usuarios)) {
      for (const item of payload.usuarios) {
        if (item.id_usuario) {
          await prisma.usuario.upsert({
            where: { id_usuario: item.id_usuario },
            create: item,
            update: item,
          });
          appliedCounts.usuarios++;
        }
      }
    }

    if (Array.isArray(payload.propiedades)) {
      for (const item of payload.propiedades) {
        if (item.id_propiedad) {
          await prisma.propiedad.upsert({
            where: { id_propiedad: item.id_propiedad },
            create: item,
            update: item,
          });
          appliedCounts.propiedades++;
        }
      }
    }

    if (Array.isArray(payload.clientes)) {
      for (const item of payload.clientes) {
        if (item.id_cliente) {
          await prisma.cliente.upsert({
            where: { id_cliente: item.id_cliente },
            create: item,
            update: item,
          });
          appliedCounts.clientes++;
        }
      }
    }

    return NextResponse.json({
      status: 'ok',
      applied: appliedCounts,
      skipped: skippedCounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al procesar lote de sincronización', detail: error?.message },
      { status: 500 }
    );
  }
}
