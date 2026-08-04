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
      where: { updatedAt: { gt: sinceDate } },
    });

    const clientes = await prisma.cliente.findMany({
      where: { updatedAt: { gt: sinceDate } },
    });

    const propiedades = await prisma.propiedad.findMany({
      where: { updatedAt: { gt: sinceDate } },
    });

    const notas = await prisma.nota.findMany({
      where: { updatedAt: { gt: sinceDate } },
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      data: {
        usuarios,
        clientes,
        propiedades,
        notas,
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

    const appliedCounts = { usuarios: 0, clientes: 0, propiedades: 0, notas: 0 };
    const skippedCounts = { usuarios: 0, clientes: 0, propiedades: 0, notas: 0 };

    // 1. Sincronizar Usuarios
    if (Array.isArray(payload.usuarios)) {
      for (const item of payload.usuarios) {
        const result = await upsertLastWriteWins('usuario', item);
        if (result.applied) appliedCounts.usuarios++;
        else skippedCounts.usuarios++;
      }
    }

    // 2. Sincronizar Clientes
    if (Array.isArray(payload.clientes)) {
      for (const item of payload.clientes) {
        const result = await upsertLastWriteWins('cliente', item);
        if (result.applied) appliedCounts.clientes++;
        else skippedCounts.clientes++;
      }
    }

    // 3. Sincronizar Propiedades
    if (Array.isArray(payload.propiedades)) {
      for (const item of payload.propiedades) {
        const result = await upsertLastWriteWins('propiedad', item);
        if (result.applied) appliedCounts.propiedades++;
        else skippedCounts.propiedades++;
      }
    }

    // 4. Sincronizar Notas
    if (Array.isArray(payload.notas)) {
      for (const item of payload.notas) {
        const result = await upsertLastWriteWins('nota', item);
        if (result.applied) appliedCounts.notas++;
        else skippedCounts.notas++;
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
      { error: 'Error al procesar el lote de sincronización', detail: error?.message },
      { status: 500 }
    );
  }
}

/**
 * Función auxiliar para aplicar la regla "Last-Write-Wins" (Gana la fecha updatedAt más reciente)
 */
async function upsertLastWriteWins(modelName: 'usuario' | 'cliente' | 'propiedad' | 'nota', incomingRecord: any) {
  const { id, createdAt, updatedAt, ...recordData } = incomingRecord;
  if (!id) return { applied: false };

  const modelDelegate = (prisma as any)[modelName];
  const incomingUpdatedAt = new Date(updatedAt || Date.now());

  const existingRecord = await modelDelegate.findUnique({
    where: { id },
  });

  if (!existingRecord) {
    // Si no existe, insertar registro con su ID y fechas originales
    await modelDelegate.create({
      data: {
        id,
        ...recordData,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        updatedAt: incomingUpdatedAt,
      },
    });
    return { applied: true };
  }

  const localUpdatedAt = new Date(existingRecord.updatedAt);

  // Regla "Gana la escritura más reciente"
  if (incomingUpdatedAt.getTime() > localUpdatedAt.getTime()) {
    await modelDelegate.update({
      where: { id },
      data: {
        ...recordData,
        updatedAt: incomingUpdatedAt,
      },
    });
    return { applied: true };
  }

  // Omite si el registro local es más reciente o igual
  return { applied: false };
}
