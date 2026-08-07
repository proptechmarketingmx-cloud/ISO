import { NextRequest, NextResponse } from 'next/server';
import { listarClientes, crearCliente } from '@/lib/services/clienteService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busqueda = searchParams.get('busqueda') || undefined;
    const estado = searchParams.get('estado') || undefined;
    const asesorId = searchParams.get('asesor_id') ? parseInt(searchParams.get('asesor_id')!) : undefined;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0;
    const take = searchParams.get('take') ? parseInt(searchParams.get('take')!) : 50;

    const resultado = await listarClientes({ busqueda, estado, asesorId, skip, take });
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al listar clientes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nombre || !body.apellido_paterno) {
      return NextResponse.json({ error: 'Nombre y apellido paterno son obligatorios' }, { status: 400 });
    }

    const nuevoCliente = await crearCliente(body);
    return NextResponse.json(nuevoCliente, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear cliente' }, { status: error?.code === 'CLIENTE_DUPLICADO' ? 409 : 500 });
  }
}
