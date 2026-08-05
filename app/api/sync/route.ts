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
    // 1. Usuario
    const usuarios = await prisma.usuario.findMany({
      where: { updatedAt: { gt: sinceDate } },
    });

    // 2. Propiedad
    const propiedades = await prisma.propiedad.findMany({
      where: { updatedAt: { gt: sinceDate } },
    });

    // 3. Cliente
    const clientes = await prisma.cliente.findMany({
      where: { updatedAt: { gt: sinceDate } },
    });

    // 4. Nota
    const notas = await prisma.nota.findMany({
      where: { updatedAt: { gt: sinceDate } },
    });

    // Retorna los datos agrupados exactamente en el orden: Usuario, Propiedad, Cliente, Nota
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      data: {
        usuarios,
        propiedades,
        clientes,
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

    const appliedCounts = { usuarios: 0, propiedades: 0, clientes: 0, notas: 0 };
    const skippedCounts = { usuarios: 0, propiedades: 0, clientes: 0, notas: 0 };

    // ORDEN OBLIGATORIO DE APLICACIÓN PARA RESPETAR RELACIONES DE CLAVE FORÁNEA:
    // 1. Usuario
    const usuariosList = payload.usuarios || payload.usuario || [];
    if (Array.isArray(usuariosList)) {
      for (const item of usuariosList) {
        const result = await upsertLastWriteWins('usuario', item);
        if (result.applied) appliedCounts.usuarios++;
        else skippedCounts.usuarios++;
      }
    }

    // 2. Propiedad
    const propiedadesList = payload.propiedades || payload.propiedad || [];
    if (Array.isArray(propiedadesList)) {
      for (const item of propiedadesList) {
        const result = await upsertLastWriteWins('propiedad', item);
        if (result.applied) appliedCounts.propiedades++;
        else skippedCounts.propiedades++;
      }
    }

    // 3. Cliente
    const clientesList = payload.clientes || payload.cliente || [];
    if (Array.isArray(clientesList)) {
      for (const item of clientesList) {
        const result = await upsertLastWriteWins('cliente', item);
        if (result.applied) appliedCounts.clientes++;
        else skippedCounts.clientes++;
      }
    }

    // 4. Nota
    const notasList = payload.notas || payload.nota || [];
    if (Array.isArray(notasList)) {
      for (const item of notasList) {
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
 * Función auxiliar para aplicar la regla "Last-Write-Wins" (Gana la fecha updatedAt más reciente),
 * incluyendo soporte para registros con soft-delete (deletedAt no nulo).
 */
async function upsertLastWriteWins(modelName: 'usuario' | 'cliente' | 'propiedad' | 'nota', incomingRecord: any) {
  const { id, createdAt, updatedAt, deletedAt, ...recordData } = incomingRecord;
  if (!id) return { applied: false };

  const modelDelegate = (prisma as any)[modelName];
  const incomingUpdatedAt = new Date(updatedAt || Date.now());
  const incomingDeletedAt = deletedAt ? new Date(deletedAt) : null;

  const existingRecord = await modelDelegate.findUnique({
    where: { id },
  });

  if (!existingRecord) {
    // Si no existe localmente, insertar registro conservando sus timestamps y estado de soft-delete
    await modelDelegate.create({
      data: {
        id,
        ...recordData,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        updatedAt: incomingUpdatedAt,
        deletedAt: incomingDeletedAt,
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
        deletedAt: incomingDeletedAt,
      },
    });
    return { applied: true };
  }

  // Omite si el registro local es igual o más reciente
  return { applied: false };
}
