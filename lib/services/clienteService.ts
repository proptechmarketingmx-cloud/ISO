import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export function calcularEdadYGeneracion(fechaNacimientoStr?: string | null): { edad: number | null; generacion: string | null } {
  if (!fechaNacimientoStr) return { edad: null, generacion: null };
  const birth = new Date(fechaNacimientoStr);
  if (isNaN(birth.getTime())) return { edad: null, generacion: null };

  const now = new Date();
  let edad = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    edad--;
  }

  const birthYear = birth.getFullYear();
  let generacion: string | null = null;
  if (birthYear > 2012) generacion = 'Generación Alfa';
  else if (birthYear >= 1997) generacion = 'Generación Z';
  else if (birthYear >= 1981) generacion = 'Millennials';
  else if (birthYear >= 1965) generacion = 'Generación X';
  else if (birthYear >= 1946) generacion = 'Baby Boomers';
  else generacion = 'Generación Silenciosa';

  return { edad, generacion };
}

export function extraerLada(telefono?: string | null): string | null {
  if (!telefono) return null;
  const normalized = telefono.trim();
  if (normalized.startsWith('+')) {
    const match = normalized.match(/^\+(\d{1,4})/);
    return match ? `+${match[1]}` : null;
  }
  return '+52';
}

export class ClienteDuplicadoError extends Error {
  code = 'CLIENTE_DUPLICADO';
}

export async function listarClientes(filtros: {
  tenantId?: number | null;
  estado?: string;
  asesorId?: number;
  busqueda?: string;
  skip?: number;
  take?: number;
}) {
  const where: Prisma.ClienteWhereInput = {
    deletedAt: null,
  };

  if (filtros.tenantId !== undefined && filtros.tenantId !== null) {
    where.id_tenant = filtros.tenantId;
  }

  if (filtros.estado) {
    where.estado_cliente = filtros.estado;
  }

  if (filtros.asesorId) {
    where.id_asesor = filtros.asesorId;
  }

  if (filtros.busqueda) {
    where.OR = [
      { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
      { apellido_paterno: { contains: filtros.busqueda, mode: 'insensitive' } },
      { correo: { contains: filtros.busqueda, mode: 'insensitive' } },
      { whatsapp: { contains: filtros.busqueda, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.cliente.count({ where }),
    prisma.cliente.findMany({
      where,
      include: {
        asesor: true,
        tenant: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip: filtros.skip || 0,
      take: filtros.take || 50,
    }),
  ]);

  return { total, items };
}

export async function crearCliente(data: any, tenantId?: number | null) {
  const { edad, generacion } = calcularEdadYGeneracion(data.fecha_nacimiento);
  const lada = extraerLada(data.telefono_principal || data.whatsapp);
  const id_tenant = tenantId ?? data.id_tenant ?? null;
  const normalized = {
    correo: data.correo?.trim().toLowerCase() || null,
    telefono_principal: data.telefono_principal?.trim() || null,
    whatsapp: data.whatsapp?.trim() || null,
    curp: data.curp?.trim().toUpperCase() || null,
  };

  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.cliente.findFirst({
      where: {
        deletedAt: null,
        ...(id_tenant !== null ? { id_tenant } : {}),
        OR: Object.entries(normalized).filter(([, value]) => value).map(([key, value]) => ({ [key]: value })),
      },
      select: { correo: true, telefono_principal: true, whatsapp: true, curp: true },
    });
    if (duplicate) {
      const fields = Object.entries(normalized).filter(([key, value]) => value && duplicate[key as keyof typeof duplicate] === value).map(([key]) => key);
      throw new ClienteDuplicadoError(`Ya existe un cliente con ${fields.join(', ')}`);
    }
    return tx.cliente.create({
      data: { ...data, ...normalized, id_tenant, edad: edad !== null ? edad : data.edad, generacion: generacion || data.generacion, lada: lada || data.lada },
      include: { asesor: true },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function obtenerClientePorId(id: number) {
  return await prisma.cliente.findUnique({
    where: { id_cliente: id },
    include: {
      asesor: true,
      actividades: { orderBy: { fecha: 'desc' } },
      documentos: { orderBy: { fecha_subida: 'desc' } },
      notas: { orderBy: { fecha: 'desc' } },
      historial: { orderBy: { fecha: 'desc' } },
    },
  });
}

export async function actualizarCliente(id: number, data: any) {
  if (data.fecha_nacimiento) {
    const { edad, generacion } = calcularEdadYGeneracion(data.fecha_nacimiento);
    data.edad = edad;
    data.generacion = generacion;
  }

  if (data.telefono_principal || data.whatsapp) {
    data.lada = extraerLada(data.telefono_principal || data.whatsapp);
  }

  return await prisma.cliente.update({
    where: { id_cliente: id },
    data,
    include: {
      asesor: true,
    },
  });
}

export async function softDeleteCliente(id: number, usuario?: string) {
  return await prisma.$transaction([
    prisma.cliente.update({
      where: { id_cliente: id },
      data: { deletedAt: new Date() },
    }),
    prisma.clienteHistorial.create({
      data: {
        id_cliente: id,
        accion: 'SOFT_DELETE',
        descripcion: 'Cliente eliminado suavemente desde el sistema',
        usuario: usuario || 'Sistema',
      },
    }),
  ]);
}
