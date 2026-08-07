import { NextRequest, NextResponse } from 'next/server';
import { obtenerClientePorId, actualizarCliente, softDeleteCliente } from '@/lib/services/clienteService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const cliente = await obtenerClientePorId(id);
    if (!cliente || cliente.deletedAt) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(cliente);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener cliente' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const body = await req.json();
    const actualizado = await actualizarCliente(id, body);
    return NextResponse.json(actualizado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al actualizar cliente' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    await softDeleteCliente(id);
    return NextResponse.json({ mensaje: 'Cliente eliminado suavemente con éxito' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al eliminar cliente' }, { status: 500 });
  }
}
